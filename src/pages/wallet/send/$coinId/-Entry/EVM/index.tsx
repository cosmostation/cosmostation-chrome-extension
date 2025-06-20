import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isValidAddress } from 'ethereumjs-util';
import { ethers } from 'ethers';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AddressBottomSheet from '@/components/AddressBottomSheet/index.tsx';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import ChainSelectBox from '@/components/ChainSelectBox/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import type { BasicFeeOption, EIP1559FeeOption, FeeOption } from '@/components/Fee/EVMFee/components/FeeSettingBottomSheet/index.tsx';
import EVMFee from '@/components/Fee/EVMFee/index.tsx';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm.ts';
import { ERC20_ABI } from '@/constants/evm/abi.ts';
import { DEFAULT_GAS_MULTIPLY, EVM_DEFAULT_GAS } from '@/constants/evm/fee.ts';
import { useENS } from '@/hooks/evm/useENS.ts';
import { useEstimateGas } from '@/hooks/evm/useEstimateGas.ts';
import { useFee } from '@/hooks/evm/useFee.ts';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount.ts';
import { useCurrentPassword } from '@/hooks/useCurrentPassword.ts';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset.ts';
import { getKeypair } from '@/libs/address.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { isTestnetChain } from '@/utils/chain.ts';
import { ethersProvider } from '@/utils/ethereum/ethers.ts';
import { signAndExecuteTxSequentially } from '@/utils/ethereum/sign.ts';
import { ceil, gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, getUniqueChainId, getUniqueChainIdWithManual, isMatchingUniqueChainId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { isDecimal, isEqualsIgnoringCase, safeStringify, shorterAddress, toHex } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore.ts';

import {
  AddressBookButton,
  CoinContainer,
  CoinDenomContainer,
  CoinImage,
  CoinSymbolText,
  DescriptionContainer,
  Divider,
  EstimatedValueTextContainer,
  InputWrapper,
} from './styled.tsx';
import TxProcessingOverlay from '../components/TxProcessingOverlay/index.tsx';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type EVMProps = {
  coinId: string;
};

export default function EVM({ coinId }: EVMProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isDisabled, setIsDisabled] = useState(false);

  const [currentFeeStepKey, setCurrentFeeStepKey] = useState<number>(1);
  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();
  const [customGasPrice, setCustomGasPrice] = useState('');
  const [customMaxBaseFeeAmount, setCustomMaxBaseFeeAmount] = useState('');
  const [customPriorityFeeAmount, setCustomPriorityFeeAmount] = useState('');

  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoinToSend = getEVMAccountAsset();
  const selectedChainId = (() => {
    const { chainId, chainType } = parseCoinId(coinId);

    return getUniqueChainId({
      id: chainId,
      chainType: chainType,
    });
  })();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const nativeAccountAsset = useMemo(
    () =>
      [...(accountAllAssets?.evmAccountAssets || []), ...(accountAllAssets?.evmAccountCustomAssets || [])].find(
        (item) => isMatchingUniqueChainId(item.chain, selectedChainId) && item.asset.id === NATIVE_EVM_COIN_ADDRESS,
      ),
    [accountAllAssets?.evmAccountAssets, accountAllAssets?.evmAccountCustomAssets, selectedChainId],
  );
  const nativeAccountAssetCoinId = useMemo(() => (nativeAccountAsset ? getCoinId(nativeAccountAsset.asset) : ''), [nativeAccountAsset]);

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol
    ? selectedCoinToSend.asset.symbol + `${isTestnetChain(selectedCoinToSend.chain.id) ? ' (Testnet)' : ''}`
    : '';
  const coinDenom = selectedCoinToSend?.asset.id || '';
  const shortCoinDenom = shorterAddress(coinDenom, 16);
  const coinDecimals = selectedCoinToSend?.asset.decimals || 0;

  const coinType = (() => {
    if (selectedCoinToSend?.asset.type === 'erc20') {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.contract');
    }

    return '';
  })();

  const coinDescription = selectedCoinToSend?.asset.description;

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = useMemo(() => toDisplayDenomAmount(baseAvailableAmount, coinDecimals), [baseAvailableAmount, coinDecimals]);

  const [inputRecipientAddress, setInputRecipientAddress] = useState('');
  const [debouncedInputRecipientAddress] = useDebounce(inputRecipientAddress, 500);

  const ens = useENS({ coinId, domain: debouncedInputRecipientAddress });

  const nameResolvedAddress = ens.data;
  const recipientAddress = useMemo(() => nameResolvedAddress || debouncedInputRecipientAddress, [debouncedInputRecipientAddress, nameResolvedAddress]);

  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const displaySendAmountPrice = useMemo(() => (sendDisplayAmount ? times(sendDisplayAmount, coinPrice) : '0'), [coinPrice, sendDisplayAmount]);

  const baseSendAmount = useMemo(() => toBaseDenomAmount(sendDisplayAmount || '0', coinDecimals), [coinDecimals, sendDisplayAmount]);

  const sendTx = useMemo(() => {
    if (!gt(sendDisplayAmount || '0', '0') || !recipientAddress) return undefined;

    const amount = toHex(toBaseDenomAmount(sendDisplayAmount || '0', coinDecimals), { addPrefix: true, isStringNumber: true });

    const senderAddress = selectedCoinToSend?.address.address || '';

    if (selectedCoinToSend?.asset.type !== 'erc20') {
      return {
        from: senderAddress,
        to: recipientAddress,
        value: amount,
      };
    }
    const rpcURLs = selectedCoinToSend?.chain.rpcUrls.map((item) => item.url) || [];

    const provider = ethersProvider(rpcURLs[0]);

    const tokenAddress = selectedCoinToSend?.asset.id;

    const erc20Contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const data = isValidAddress(recipientAddress) ? erc20Contract.interface.encodeFunctionData('transfer', [recipientAddress, amount]) : undefined;

    return {
      from: senderAddress,
      to: tokenAddress,
      data,
    };
  }, [
    coinDecimals,
    recipientAddress,
    selectedCoinToSend?.address.address,
    selectedCoinToSend?.asset.id,
    selectedCoinToSend?.asset.type,
    selectedCoinToSend?.chain.rpcUrls,
    sendDisplayAmount,
  ]);
  const [debouncedSendTx] = useDebounce(sendTx, 500);

  const fee = useFee({ coinId });

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

  const estimatedFeeBaseAmount = useMemo(() => {
    if (currentFeeOption?.type === 'BASIC') {
      return times(currentFeeOption?.gas || '0', currentFeeOption?.gasPrice || '0', 0);
    }
    if (currentFeeOption?.type === 'EIP-1559') {
      return times(currentFeeOption?.gas || '0', currentFeeOption.maxBaseFeePerGas || '0', 0);
    }

    return '0';
  }, [currentFeeOption]);

  const finalizedTransaction = useMemo(() => {
    if (!debouncedSendTx || !selectedCoinToSend || !currentFeeOption || !gt(currentFeeOption.gas || '0', '0')) {
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
      value: BigInt(debouncedSendTx.value || '0').toString(10),
      gasLimit: currentFeeOption.gas,
      chainId: BigInt(selectedCoinToSend.chain.chainId).toString(10),
      type: currentFeeOption.type === 'EIP-1559' ? 2 : undefined,
      gasPrice: currentFeeOption?.type === 'BASIC' ? currentFeeOption.gasPrice : undefined,
      maxFeePerGas: currentFeeOption?.type === 'EIP-1559' ? currentFeeOption.maxBaseFeePerGas : undefined,
      maxPriorityFeePerGas: currentFeeOption?.type === 'EIP-1559' ? currentFeeOption.maxPriorityFeePerGas : undefined,
    };
  }, [currentFeeOption, debouncedSendTx, selectedCoinToSend]);

  const displayTx = useMemo(() => safeStringify(finalizedTransaction), [finalizedTransaction]);

  const addressInputErrorMessage = useMemo(() => {
    if (recipientAddress) {
      if (
        (recipientAddress.startsWith('0x') && !isValidAddress(recipientAddress)) ||
        isEqualsIgnoringCase(recipientAddress, selectedCoinToSend?.address.address)
      ) {
        return t('pages.wallet.send.$coinId.Entry.EVM.index.invalidAddress');
      }

      if (recipientAddress.endsWith('.eth') && !nameResolvedAddress && !ens.isLoading) {
        return t('pages.wallet.send.$coinId.Entry.EVM.index.invalidENSAddress');
      }

      if (!recipientAddress.endsWith('.eth') && !recipientAddress.startsWith('0x')) {
        return t('pages.wallet.send.$coinId.Entry.EVM.index.invalidENSFormat');
      }
    }

    return '';
  }, [ens.isLoading, nameResolvedAddress, recipientAddress, selectedCoinToSend?.address.address, t]);

  const sendAmountInputErrorMessage = useMemo(() => {
    if (sendDisplayAmount) {
      if (isEqualsIgnoringCase(selectedCoinToSend?.asset.id, NATIVE_EVM_COIN_ADDRESS)) {
        const totalCostAmount = plus(baseSendAmount, estimatedFeeBaseAmount);

        if (gt(totalCostAmount, baseAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.EVM.index.insufficientAmount');
        }
      } else {
        if (gt(baseSendAmount, baseAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.EVM.index.insufficientAmount');
        }
      }

      if (!gt(sendDisplayAmount, '0')) {
        return t('pages.wallet.send.$coinId.Entry.EVM.index.tooLowAmount');
      }
    }

    return '';
  }, [baseAvailableAmount, baseSendAmount, estimatedFeeBaseAmount, selectedCoinToSend?.asset.id, sendDisplayAmount, t]);

  const errorMessage = useMemo(() => {
    if (selectedCoinToSend?.chain.isDiableSend) {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.bankLocked');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (!recipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.noRecipientAddress');
    }

    if (baseAvailableAmount === '0') {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.noAvailableAmount');
    }

    if (!sendDisplayAmount) {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.noAmount');
    }

    if (sendAmountInputErrorMessage) {
      return sendAmountInputErrorMessage;
    }

    if (!sendTx) {
      return t('pages.wallet.send.$coinId.Entry.EVM.index.noTransaction');
    }

    return '';
  }, [
    addressInputErrorMessage,
    baseAvailableAmount,
    recipientAddress,
    selectedCoinToSend?.chain.isDiableSend,
    sendAmountInputErrorMessage,
    sendDisplayAmount,
    sendTx,
    t,
  ]);

  const handleOnClickMax = () => {
    if (selectedCoinToSend?.asset.type !== 'erc20') {
      const maxAmount = minus(baseAvailableAmount, estimatedFeeBaseAmount);

      setSendDisplayAmount(gt(maxAmount, '0') ? toDisplayDenomAmount(maxAmount, coinDecimals) : '0');
    } else {
      setSendDisplayAmount(displayAvailableAmount);
    }
  };

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedCoinToSend?.chain) {
        throw new Error('Chain not found');
      }

      if (!finalizedTransaction) {
        throw new Error('Failed to calculate final transaction');
      }

      const keyPair = getKeypair(selectedCoinToSend.chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const rpcURLs = selectedCoinToSend?.chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signAndExecuteTxSequentially(privateKey, finalizedTransaction, rpcURLs);

      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const { chainId, chainType } = parseCoinId(coinId);
      const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
      addTx({ txHash: response.hash, chainId: uniqueChainId, address: selectedCoinToSend.address.address, addedAt: Date.now(), retryCount: 0 });

      navigate({
        to: TxResult.to,
        search: {
          address: recipientAddress,
          coinId,
          txHash: response.hash,
        },
      });
    } catch {
      navigate({
        to: TxResult.to,
        search: {
          coinId,
        },
      });
    } finally {
      setIsOpenTxProcessingOverlay(false);
    }
  }, [
    addTx,
    coinId,
    currentAccount,
    currentPassword,
    finalizedTransaction,
    navigate,
    recipientAddress,
    selectedCoinToSend?.address.address,
    selectedCoinToSend?.chain,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, sendTx, estimateGas.isFetching]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.Entry.EVM.index.send')}`}</CoinSymbolText>
            {coinType ? (
              <CoinDenomContainer>
                <Typography variant="b4_R">{`${coinType} :`}</Typography>
                &nbsp;
                <Typography variant="b3_M">{shortCoinDenom}</Typography>
              </CoinDenomContainer>
            ) : (
              <DescriptionContainer>
                <Typography variant="b3_M">{coinDescription}</Typography>
              </DescriptionContainer>
            )}
          </CoinContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={selectedCoinToSend?.chain ? [selectedCoinToSend?.chain] : []}
              currentChainId={selectedCoinToSend?.chain && getUniqueChainId(selectedCoinToSend?.chain)}
              disableSortChain
              label={t('pages.wallet.send.$coinId.Entry.EVM.index.recipientNetwork')}
              disabled
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.EVM.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage || nameResolvedAddress || ''}
              isLoadingHelperText={ens.isLoading}
              value={inputRecipientAddress}
              onChange={(e) => setInputRecipientAddress(e.target.value)}
              inputVarient="address"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <AddressBookButton onClick={() => setIsOpenAddressBottomSheet(true)}>
                        <AddressBookIcon />
                      </AddressBookButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.EVM.index.amount')}
              error={!!sendAmountInputErrorMessage}
              helperText={sendAmountInputErrorMessage}
              value={sendDisplayAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimals || 0) && e.currentTarget.value) {
                  return;
                }

                setSendDisplayAmount(e.currentTarget.value);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isApporximation>
                          {displaySendAmountPrice}
                        </NumberTypo>
                      </EstimatedValueTextContainer>
                    </InputAdornment>
                  ),
                },
              }}
              rightBottomAdornment={
                selectedCoinToSend && <BalanceButton onClick={handleOnClickMax} coin={selectedCoinToSend?.asset} balance={baseAvailableAmount} />
              }
            />
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

      {selectedCoinToSend?.chain && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          filterAddress={selectedCoinToSend?.address.address}
          chainId={getUniqueChainId(selectedCoinToSend.chain)}
          headerTitle={t('pages.wallet.send.$coinId.Entry.EVM.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setInputRecipientAddress(address);
          }}
        />
      )}
      <ReviewBottomSheet
        rawTxString={displayTx}
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={
          selectedCoinToSend?.asset.symbol
            ? t('pages.wallet.send.$coinId.Entry.EVM.index.sendReviewWithSymbol', {
                symbol: selectedCoinToSend.asset.symbol,
              })
            : t('pages.wallet.send.$coinId.Entry.EVM.index.sendReview')
        }
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.EVM.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.EVM.index.send')}
        onClickConfirm={handleOnClickConfirm}
      />

      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.EVM.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.EVM.index.txProcessingSub')}
      />
    </>
  );
}
