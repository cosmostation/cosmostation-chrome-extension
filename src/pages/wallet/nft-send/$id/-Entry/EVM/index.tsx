import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isValidAddress } from 'ethereumjs-util';
import { ethers } from 'ethers';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AddressBottomSheet from '@/components/AddressBottomSheet';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import ChainSelectBox from '@/components/ChainSelectBox';
import IconButton from '@/components/common/IconButton';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import EVMFee from '@/components/Fee/EVMFee';
import type { BasicFeeOption, EIP1559FeeOption, FeeOption } from '@/components/Fee/EVMFee/components/FeeSettingBottomSheet';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { ERC721_ABI, ERC1155_ABI } from '@/constants/evm/abi';
import { EVM_DEFAULT_GAS } from '@/constants/evm/fee';
import { useCurrentAddedEVMNFTsWithMetaData } from '@/hooks/evm/nft/useCurrentAddedEVMNFTsWithMetaData';
import { useGetNFTBalance } from '@/hooks/evm/nft/useGetNFTBalance';
import { useGetNFTURI } from '@/hooks/evm/nft/useGetNFTURI';
import { useEstimateGas } from '@/hooks/evm/useEstimateGas';
import { useFee } from '@/hooks/evm/useFee';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { ethersProvider } from '@/utils/ethereum/ethers';
import { signAndExecuteTxSequentially } from '@/utils/ethereum/sign';
import { ceil, gt, times } from '@/utils/numbers.ts';
import { getCoinId, getUniqueChainId, getUniqueChainIdWithManual, isSameChain } from '@/utils/queryParamGenerator.ts';
import { ethereumAddressRegex } from '@/utils/regex';
import { isEqualsIgnoringCase, isNumber, safeStringify, shorterAddress } from '@/utils/string.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

import BalanceButton from './components/BalanceButton';
import { Divider, InputWrapper, NFTContainer, NFTImage, NFTName, NFTSubname } from './styled';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type EVMProps = { id: string };

export default function EVM({ id }: EVMProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendQuantity, setSendQuantity] = useState('');

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [currentFeeStepKey, setCurrentFeeStepKey] = useState<number>(1);
  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();
  const [customGasPrice, setCustomGasPrice] = useState('');
  const [customMaxBaseFeeAmount, setCustomMaxBaseFeeAmount] = useState('');
  const [customPriorityFeeAmount, setCustomPriorityFeeAmount] = useState('');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { chainList } = useChainList();
  const { addedEVMNFTsWithMeta, isLoading: isLoadingEVMNFTs } = useCurrentAddedEVMNFTsWithMetaData();

  const selectedNFT = useMemo(() => addedEVMNFTsWithMeta.find((nft) => nft.id === id), [addedEVMNFTsWithMeta, id]);

  const { data: nftSourceURI } = useGetNFTURI({
    chainId: selectedNFT && getUniqueChainIdWithManual(selectedNFT.chainId, selectedNFT.chainType),
    contractAddress: selectedNFT?.contractAddress,
    tokenId: selectedNFT?.tokenId,
    tokenStandard: selectedNFT?.tokenType,
  });

  const { data: currentNFTBalance } = useGetNFTBalance({
    chainId: selectedNFT && getUniqueChainIdWithManual(selectedNFT.chainId, selectedNFT.chainType),
    contractAddress: selectedNFT?.contractAddress,
    tokenId: selectedNFT?.tokenId,
    ownerAddress: selectedNFT?.ownerAddress,
    tokenStandard: selectedNFT?.tokenType,
  });

  const chain = useMemo(
    () => chainList.evmChains?.find((chain) => chain.id === selectedNFT?.chainId && chain.chainType === selectedNFT.chainType),
    [chainList.evmChains, selectedNFT?.chainId, selectedNFT?.chainType],
  );

  const nftImage = selectedNFT?.image;
  const nftName = selectedNFT?.name || shorterAddress(selectedNFT?.contractAddress, 12) || '-';
  const nftContractAddress =
    selectedNFT?.contractAddress && selectedNFT.contractAddress.length > 12 ? shorterAddress(selectedNFT.contractAddress, 12) : selectedNFT?.contractAddress;

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const nativeAccountAsset = useMemo(
    () =>
      chain &&
      [...(accountAllAssets?.evmAccountAssets || []), ...(accountAllAssets?.evmAccountCustomAssets || [])].find(
        (item) => isSameChain(item.chain, chain) && item.asset.id === chain.mainAssetDenom,
      ),
    [accountAllAssets?.evmAccountAssets, accountAllAssets?.evmAccountCustomAssets, chain],
  );

  const nativeAccountAssetCoinId = useMemo(() => (nativeAccountAsset ? getCoinId(nativeAccountAsset.asset) : ''), [nativeAccountAsset]);
  const availableFeeCoinBalance = nativeAccountAsset?.balance || '0';

  const sendTx = useMemo(() => {
    if (!selectedNFT || !chain) {
      return undefined;
    }

    for (const rpc of chain.rpcUrls) {
      if (!rpc.url) {
        continue;
      }

      try {
        const provider = ethersProvider(rpc.url);

        if (selectedNFT.tokenType === 'ERC721') {
          const erc721Contract = new ethers.Contract(selectedNFT.contractAddress, ERC721_ABI, provider);

          const data = ethereumAddressRegex.test(recipientAddress)
            ? erc721Contract.interface.encodeFunctionData('transferFrom', [selectedNFT.ownerAddress, recipientAddress, selectedNFT.tokenId])
            : undefined;

          return {
            from: selectedNFT.ownerAddress,
            to: selectedNFT.contractAddress,
            data,
          };
        }

        if (selectedNFT.tokenType === 'ERC1155' && nftSourceURI && sendQuantity) {
          const erc1155Contract = new ethers.Contract(selectedNFT.contractAddress, ERC1155_ABI, provider);

          const data = ethereumAddressRegex.test(recipientAddress)
            ? erc1155Contract.interface.encodeFunctionData('safeTransferFrom', [
                selectedNFT.ownerAddress,
                recipientAddress,
                selectedNFT.tokenId,
                Number(sendQuantity),
                `${ethers.hexlify(ethers.toUtf8Bytes(`${nftSourceURI}`))}`,
              ])
            : undefined;

          return {
            from: selectedNFT.ownerAddress,
            to: selectedNFT.contractAddress,
            data,
          };
        }
      } catch {
        // Intentionally left empty to continue to the next RPC URL}
      }
    }

    return undefined;
  }, [chain, nftSourceURI, recipientAddress, selectedNFT, sendQuantity]);

  const [debouncedSendTx] = useDebounce(sendTx, 500);

  const fee = useFee({ coinId: nativeAccountAssetCoinId });

  const estimateGas = useEstimateGas({ coinId: nativeAccountAssetCoinId, bodyParams: debouncedSendTx && [debouncedSendTx] });

  const alternativeGas = useMemo(() => {
    const gasCoefficient = nativeAccountAsset?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;

    const baseEstimateGas = times(BigInt(estimateGas.data?.result || EVM_DEFAULT_GAS).toString(10), gasCoefficient);

    return ceil(baseEstimateGas);
  }, [estimateGas.data?.result, nativeAccountAsset?.chain.feeInfo.gasCoefficient]);

  const feeOptions = useMemo(() => {
    const defaultFeeOption = {
      coinId: nativeAccountAsset?.asset ? getCoinId(nativeAccountAsset.asset) : '',
      decimals: nativeAccountAsset?.asset.decimals || 0,
      denom: nativeAccountAsset?.asset.id,
      coinGeckoId: nativeAccountAsset?.asset.coinGeckoId,
      symbol: nativeAccountAsset?.asset.symbol || '',
    };

    const customOption = (() => {
      if (fee.type === 'BASIC') {
        return {
          ...defaultFeeOption,
          type: 'BASIC',
          gas: customGasAmount,
          gasPrice: customGasPrice,
          title: 'Custom',
        } as BasicFeeOption;
      }

      if (fee.type === 'EIP-1559') {
        return {
          ...defaultFeeOption,
          type: 'EIP-1559',
          gas: customGasAmount,
          maxBaseFeePerGas: customMaxBaseFeeAmount,
          maxPriorityFeePerGas: customPriorityFeeAmount,
          title: 'Custom',
        } as EIP1559FeeOption;
      }
    })();

    const alternativeFeeOptions = (() => {
      const feeStepNames = ['Low', 'Average', 'High'];

      if (fee.type === 'BASIC') {
        const baseGasPrice = fee.currentGasPrice || '0';

        const gasPrices = [baseGasPrice, times(baseGasPrice, '1.2'), times(baseGasPrice, '2')];

        return gasPrices.map(
          (item, i) =>
            ({
              ...defaultFeeOption,
              type: 'BASIC',
              gas: alternativeGas,
              gasPrice: item,
              title: feeStepNames[i] || 'Fee',
            }) as BasicFeeOption,
        );
      }

      if (fee.type === 'EIP-1559') {
        const eipFeeList = fee.currentFee || [];

        return eipFeeList.map(
          (item, i) =>
            ({
              ...defaultFeeOption,
              type: 'EIP-1559',
              gas: alternativeGas,
              maxBaseFeePerGas: item.maxBaseFeePerGas,
              maxPriorityFeePerGas: item.maxPriorityFeePerGas,
              title: feeStepNames[i] || 'Fee',
            }) as EIP1559FeeOption,
        );
      }

      return [];
    })();

    return [...alternativeFeeOptions, customOption].filter((item) => !!item);
  }, [
    alternativeGas,
    customGasAmount,
    customGasPrice,
    customMaxBaseFeeAmount,
    customPriorityFeeAmount,
    fee.currentFee,
    fee.currentGasPrice,
    fee.type,
    nativeAccountAsset?.asset,
  ]);

  const currentFeeOption = useMemo<FeeOption | undefined>(() => feeOptions[currentFeeStepKey], [feeOptions, currentFeeStepKey]);

  const finalizedTransaction = useMemo(() => {
    if (!debouncedSendTx || !chain || !currentFeeOption || !gt(currentFeeOption.gas || '0', '0')) {
      return null;
    }

    if (currentFeeOption.type === 'BASIC' && (!currentFeeOption.gasPrice || !gt(currentFeeOption.gasPrice, '0'))) {
      return null;
    }

    if (currentFeeOption.type === 'EIP-1559' && (!currentFeeOption || !currentFeeOption.maxBaseFeePerGas || !currentFeeOption.maxPriorityFeePerGas)) {
      return null;
    }

    return {
      from: debouncedSendTx.from,
      to: debouncedSendTx.to,
      data: debouncedSendTx.data,
      gasLimit: currentFeeOption.gas,
      chainId: BigInt(chain.chainId).toString(10),
      type: currentFeeOption.type === 'EIP-1559' ? 2 : undefined,
      gasPrice: currentFeeOption?.type === 'BASIC' ? currentFeeOption.gasPrice : undefined,
      maxPriorityFeePerGas: currentFeeOption?.type === 'EIP-1559' ? currentFeeOption.maxPriorityFeePerGas : undefined,
      maxFeePerGas: currentFeeOption?.type === 'EIP-1559' ? currentFeeOption.maxBaseFeePerGas : undefined,
    };
  }, [chain, currentFeeOption, debouncedSendTx]);

  const currentBaseFee = useMemo(() => {
    if (currentFeeOption?.type === 'EIP-1559') {
      return times(currentFeeOption?.maxBaseFeePerGas || '0', currentFeeOption.gas || '0', 0);
    }

    if (currentFeeOption?.type === 'BASIC') {
      return times(currentFeeOption.gasPrice || '0', currentFeeOption.gas || '0', 0);
    }

    return '0';
  }, [currentFeeOption]);

  const displayTx = useMemo(() => safeStringify(finalizedTransaction), [finalizedTransaction]);

  const sendQuantityErrorMessage = useMemo(() => {
    if (sendQuantity) {
      if (!isNumber(sendQuantity)) {
        return t('pages.wallet.nft-send.$id.Entry.EVM.index.invalidAmount');
      }

      if (gt(sendQuantity, currentNFTBalance || '0')) {
        return t('pages.wallet.nft-send.$id.Entry.EVM.index.insufficientNFTAmount');
      }
      if (!gt(sendQuantity, '0')) {
        return t('pages.wallet.nft-send.$id.Entry.EVM.index.tooLowAmount');
      }
    }

    return '';
  }, [currentNFTBalance, sendQuantity, t]);

  const addressInputErrorMessage = (() => {
    if (recipientAddress && (!isValidAddress(recipientAddress) || isEqualsIgnoringCase(recipientAddress, selectedNFT?.ownerAddress))) {
      return t('pages.wallet.nft-send.$id.Entry.Sui.index.invalidAddress');
    }
    return '';
  })();

  const errorMessage = useMemo(() => {
    if (!selectedNFT) {
      return t('pages.wallet.nft-send.$id.Entry.EVM.index.missingNFT');
    }

    if (!selectedNFT.isOwned) {
      return t('pages.wallet.nft-send.$id.Entry.EVM.index.notOwnedNFT');
    }
    if (!ethereumAddressRegex.test(recipientAddress)) {
      return t('pages.wallet.nft-send.$id.Entry.EVM.index.invalidAddress');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (availableFeeCoinBalance === '0') {
      return t('pages.wallet.nft-send.$id.Entry.EVM.index.invalidAmount');
    }

    if (gt(currentBaseFee, availableFeeCoinBalance)) {
      return t('pages.wallet.nft-send.$id.Entry.EVM.index.insufficientAmount');
    }

    if (selectedNFT.tokenType === 'ERC1155') {
      if (sendQuantityErrorMessage) {
        return sendQuantityErrorMessage;
      }

      if (!currentNFTBalance || !nftSourceURI) {
        return t('pages.wallet.nft-send.$id.Entry.EVM.index.networkError');
      }
    }

    if (!finalizedTransaction) {
      return t('pages.wallet.nft-send.$id.Entry.EVM.index.failedToCreateTransaction');
    }

    return '';
  }, [
    addressInputErrorMessage,
    availableFeeCoinBalance,
    currentBaseFee,
    currentNFTBalance,
    finalizedTransaction,
    nftSourceURI,
    recipientAddress,
    selectedNFT,
    sendQuantityErrorMessage,
    t,
  ]);

  const handleOnClickMax = () => {
    setSendQuantity(currentNFTBalance || '0');
  };

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!chain) {
        throw new Error('Chain not found');
      }

      if (!nativeAccountAsset) {
        throw new Error('Asset not found');
      }

      if (!finalizedTransaction) {
        throw new Error('Failed to calculate final transaction');
      }

      const keyPair = getKeypair(chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const rpcURLs = chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signAndExecuteTxSequentially(privateKey, finalizedTransaction, rpcURLs);

      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const uniqueChainId = getUniqueChainIdWithManual(chain.id, chain.chainType);
      addTx({ txHash: response.hash, chainId: uniqueChainId, address: nativeAccountAsset.address.address, addedAt: Date.now(), retryCount: 0, type: 'nft' });

      navigate({
        to: TxResult.to,
        search: {
          address: recipientAddress,
          coinId: nativeAccountAssetCoinId,
          txHash: response.hash,
        },
      });
    } catch {
      navigate({
        to: TxResult.to,
        search: {
          coinId: nativeAccountAssetCoinId,
        },
      });
    } finally {
      setIsOpenTxProcessingOverlay(false);
    }
  }, [addTx, chain, currentAccount, currentPassword, finalizedTransaction, nativeAccountAsset, nativeAccountAssetCoinId, navigate, recipientAddress]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, sendTx, estimateGas.isFetching, isLoadingEVMNFTs]);

  return (
    <>
      <BaseBody>
        <>
          <NFTContainer>
            <NFTImage src={nftImage} />
            <NFTName variant="h2_B">{nftName}</NFTName>
            <NFTSubname>
              <Typography variant="b4_R">
                {t('pages.wallet.nft-send.$id.Entry.EVM.index.contract')}

                <Typography variant="b3_M">{nftContractAddress}</Typography>
              </Typography>
            </NFTSubname>
          </NFTContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={chainList.evmChains || []}
              currentChainId={chain && getUniqueChainId(chain)}
              disabled
              label={t('pages.wallet.nft-send.$id.Entry.EVM.index.recipientNetwork')}
            />
            <StandardInput
              label={t('pages.wallet.nft-send.$id.Entry.EVM.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              inputVarient="address"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton disabled={!chain} onClick={() => setIsOpenAddressBottomSheet(true)}>
                        <AddressBookIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {selectedNFT?.tokenType === 'ERC1155' && (
              <StandardInput
                label={t('pages.wallet.nft-send.$id.Entry.EVM.index.quantity')}
                error={!!sendQuantityErrorMessage}
                helperText={sendQuantityErrorMessage}
                value={sendQuantity}
                onChange={(e) => {
                  if (!isNumber(e.currentTarget.value) && e.currentTarget.value) {
                    return;
                  }

                  setSendQuantity(e.currentTarget.value);
                }}
                rightBottomAdornment={<BalanceButton onClick={handleOnClickMax} balance={currentNFTBalance || '0'} />}
              />
            )}
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <EVMFee
            feeOptionDatas={feeOptions}
            currentSelectedFeeOptionKey={currentFeeStepKey}
            errorMessage={errorMessage}
            onChangeGas={(gas) => {
              setCustomGasAmount(gas);
            }}
            onChangeGasPrice={(gasPrice) => {
              setCustomGasPrice(gasPrice);
            }}
            onChangeMaxBaseFee={(maxBaseFee) => {
              setCustomMaxBaseFeeAmount(maxBaseFee);
            }}
            onChangePriorityFee={(priorityFee) => {
              setCustomPriorityFeeAmount(priorityFee);
            }}
            onClickFeeStep={(val) => {
              setCurrentFeeStepKey(val);
            }}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
            disableConfirm={isDisabled || !!errorMessage}
            isLoading={isDisabled}
          />
        </>
      </BaseFooter>
      {chain && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          filterAddress={selectedNFT?.ownerAddress}
          chainId={getUniqueChainId(chain)}
          headerTitle={t('pages.wallet.nft-send.$id.Entry.EVM.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setRecipientAddress(address);
          }}
        />
      )}
      <ReviewBottomSheet
        rawTxString={displayTx}
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.nft-send.$id.Entry.EVM.index.sendNFTReview')}
        contentsSubTitle={t('pages.wallet.nft-send.$id.Entry.EVM.index.sendNFTReviewSub')}
        confirmButtonText={t('pages.wallet.nft-send.$id.Entry.EVM.index.sendNFT')}
        onClickConfirm={handleOnClickConfirm}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.nft-send.$id.Entry.EVM.index.txProcessing')}
        message={t('pages.wallet.nft-send.$id.Entry.EVM.index.txProcessingSub')}
      />
    </>
  );
}
