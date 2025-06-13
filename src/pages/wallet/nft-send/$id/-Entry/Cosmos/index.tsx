import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';
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
import Fee from '@/components/Fee/CosmosFee';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { COSMOS_MEMO_MAX_BYTES } from '@/constants/cosmos/tx';
import { useCurrentAddedCosmosNFTsWithMetaData } from '@/hooks/cosmos/nft/useCurrentAddedCosmosNFTsWithMetaData';
import { useAccount } from '@/hooks/cosmos/useAccount';
import { useAutoFeeCurrencySelectionOnInit } from '@/hooks/cosmos/useAutoFeeCurrencySelectionOnInit';
import { useFees } from '@/hooks/cosmos/useFees';
import { useNodeInfo } from '@/hooks/cosmos/useNodeInfo';
import { useSimulate } from '@/hooks/cosmos/useSimulate';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { cosmos } from '@/proto/cosmos-sdk-v0.47.4.js';
import { getCosmosFeeStepNames } from '@/utils/cosmos/fee';
import { protoTx, protoTxBytes } from '@/utils/cosmos/proto';
import { signDirectAndexecuteTxSequentially } from '@/utils/cosmos/sign';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { ceil, gt, times } from '@/utils/numbers.ts';
import { getCoinId, getUniqueChainId, getUniqueChainIdWithManual, isMatchingCoinId, isSameChain } from '@/utils/queryParamGenerator.ts';
import { getCosmosAddressRegex } from '@/utils/regex';
import { getUtf8BytesLength, isEqualsIgnoringCase, safeStringify, shorterAddress } from '@/utils/string.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

import { Divider, InputWrapper, NFTContainer, NFTImage, NFTName, NFTSubname } from './styled';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type CosmosProps = { id: string };

export default function Cosmos({ id }: CosmosProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [inputMemo, setInputMemo] = useState('');
  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [inputFeeStepKey, setInputFeeStepKey] = useState<number | undefined>();
  const [customFeeCoinId, setCustomFeeCoinId] = useState('');
  const [autoSetFeeCoinId, setAutoSetFeeCoinId] = useState('');
  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();
  const [customGasRate, setCustomGasRate] = useState('');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { chainList } = useChainList();
  const { addedCosmosNFTsWithMeta, isLoading: isLoadingCosmsoNFTs } = useCurrentAddedCosmosNFTsWithMetaData();

  const { currentPreferAccountType } = useCurrentPreferAccountTypes();
  const selectedNFT = useMemo(() => addedCosmosNFTsWithMeta.find((nft) => nft.id === id), [addedCosmosNFTsWithMeta, id]);

  const chain = useMemo(() => {
    const originChain = chainList.cosmosChains?.find((chain) => chain.id === selectedNFT?.chainId && chain.chainType === selectedNFT.chainType);

    if (originChain && currentPreferAccountType) {
      const selectedPreferAccountType = currentPreferAccountType[originChain.id];

      if (selectedPreferAccountType) {
        return produce(originChain, (draft) => {
          draft.accountTypes = draft.accountTypes.filter(
            (accountType) => accountType.pubkeyStyle === selectedPreferAccountType.pubkeyStyle && accountType.hdPath === selectedPreferAccountType.hdPath,
          );
        });
      }
    }

    return originChain;
  }, [chainList.cosmosChains, currentPreferAccountType, selectedNFT?.chainId, selectedNFT?.chainType]);
  const addressRegex = useMemo(() => getCosmosAddressRegex(chain?.accountPrefix || '', [39]), [chain?.accountPrefix]);

  const nftImage = selectedNFT?.image;
  const nftName = selectedNFT?.name || shorterAddress(selectedNFT?.contractAddress, 12);
  const nftContractAddress =
    selectedNFT?.contractAddress && selectedNFT.contractAddress.length > 12 ? shorterAddress(selectedNFT.contractAddress, 12) : selectedNFT?.contractAddress;

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  const accountAsset = useMemo(
    () => chain && accountAllAssets?.allCosmosAccountAssets.find((item) => isSameChain(item.chain, chain) && item.asset.id === chain.mainAssetDenom),
    [accountAllAssets?.allCosmosAccountAssets, chain],
  );

  const accountAssetCoinId = useMemo(() => (accountAsset ? getCoinId(accountAsset.asset) : ''), [accountAsset]);

  const account = useAccount({ coinId: accountAssetCoinId });
  const nodeInfo = useNodeInfo({ coinId: accountAssetCoinId });

  const { feeAssets, defaultGasRateKey, isFeemarketActive } = useFees({ coinId: accountAssetCoinId });

  const currentFeeStepKey = useMemo(() => {
    if (inputFeeStepKey !== undefined) {
      return inputFeeStepKey;
    }

    return defaultGasRateKey;
  }, [defaultGasRateKey, inputFeeStepKey]);

  const alternativeFeeAsset = useMemo(
    () =>
      customFeeCoinId
        ? feeAssets.find((item) => isMatchingCoinId(item.asset, customFeeCoinId))
        : autoSetFeeCoinId
          ? feeAssets.find((item) => isMatchingCoinId(item.asset, autoSetFeeCoinId))
          : feeAssets[0],
    [autoSetFeeCoinId, customFeeCoinId, feeAssets],
  );

  const alternativeFeeCoinId = useMemo(() => (alternativeFeeAsset?.asset ? getCoinId(alternativeFeeAsset.asset) : ''), [alternativeFeeAsset?.asset]);

  const alternativeGasRate = useMemo(() => alternativeFeeAsset?.gasRate, [alternativeFeeAsset?.gasRate]);

  const memoizedNFTSendAminoTx = useMemo(() => {
    if (accountAssetCoinId) {
      if (account.data?.value.account_number && alternativeFeeAsset?.asset.id && recipientAddress && selectedNFT?.ownerAddress && chain) {
        const sequence = String(account.data?.value.sequence || '0');

        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? chain.chainId,
          fee: {
            amount: [
              {
                denom: alternativeFeeAsset.asset.id,
                amount: chain.isEvm ? times(alternativeGasRate?.[0] || '0', chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0) : '1',
              },
            ],
            gas: String(chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
          },
          memo: inputMemo,
          msgs: [
            {
              type: 'wasm/MsgExecuteContract',
              value: {
                sender: selectedNFT.ownerAddress,
                contract: selectedNFT.contractAddress,
                msg: {
                  transfer_nft: {
                    recipient: recipientAddress,
                    token_id: selectedNFT.tokenId,
                  },
                },
                funds: [],
              },
            },
          ],
        };
      }
    }

    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    accountAssetCoinId,
    alternativeFeeAsset?.asset.id,
    alternativeGasRate,
    chain,
    inputMemo,
    nodeInfo.data?.default_node_info?.network,
    recipientAddress,
    selectedNFT?.contractAddress,
    selectedNFT?.ownerAddress,
    selectedNFT?.tokenId,
  ]);

  const [nftSendAminoTx] = useDebounce(memoizedNFTSendAminoTx, 700);

  const nftSendProtoTx = useMemo(() => {
    if (nftSendAminoTx) {
      const pTx = protoTx(
        nftSendAminoTx,
        [''],
        { type: accountAsset?.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: '' },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [accountAsset?.address.accountType.pubkeyType, nftSendAminoTx]);

  const simulate = useSimulate({ coinId: accountAssetCoinId, txBytes: nftSendProtoTx?.tx_bytes });

  const alternativeGas = useMemo(() => {
    const gasCoefficient = chain?.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(chain?.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    return baseEstimateGas;
  }, [chain?.feeInfo.defaultGasLimit, chain?.feeInfo.gasCoefficient, simulate.data?.gas_info?.gas_used]);

  const feeOptions = useMemo(() => {
    const customOption = {
      gas: customGasAmount,
      gasRate: customGasRate,
      coinId: alternativeFeeCoinId,
      decimals: alternativeFeeAsset?.asset.decimals || 0,
      balance: alternativeFeeAsset?.balance || '0',
      denom: alternativeFeeAsset?.asset.id,
      coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
      symbol: alternativeFeeAsset?.asset.symbol || '',
      title: 'Custom',
    };

    const feeStepNames = getCosmosFeeStepNames(isFeemarketActive || false, alternativeGasRate);

    const alternativeFeeOptions = alternativeGasRate
      ? alternativeGasRate.map((item, i) => ({
          gas: alternativeGas,
          gasRate: item,
          coinId: alternativeFeeCoinId,
          decimals: alternativeFeeAsset?.asset.decimals || 0,
          balance: alternativeFeeAsset?.balance || '0',
          denom: alternativeFeeAsset?.asset.id,
          coinGeckoId: alternativeFeeAsset?.asset.coinGeckoId,
          symbol: alternativeFeeAsset?.asset.symbol || '',
          title: feeStepNames[i],
        }))
      : [];

    return [...alternativeFeeOptions, customOption];
  }, [
    alternativeFeeAsset?.asset.coinGeckoId,
    alternativeFeeAsset?.asset.decimals,
    alternativeFeeAsset?.asset.id,
    alternativeFeeAsset?.asset.symbol,
    alternativeFeeAsset?.balance,
    alternativeFeeCoinId,
    alternativeGas,
    alternativeGasRate,
    customGasAmount,
    customGasRate,
    isFeemarketActive,
  ]);

  const isCustomStep = useMemo(() => {
    if (!alternativeGasRate || feeOptions.length === 0) return false;
    return feeOptions.length - 1 === currentFeeStepKey;
  }, [alternativeGasRate, currentFeeStepKey, feeOptions.length]);

  const selectedFeeOption = useMemo(() => {
    return feeOptions[currentFeeStepKey];
  }, [currentFeeStepKey, feeOptions]);

  const baseFee = useMemo(() => times(selectedFeeOption.gas || '0', selectedFeeOption.gasRate || '0'), [selectedFeeOption.gas, selectedFeeOption.gasRate]);

  const currentBaseFee = useMemo(() => {
    return ceil(baseFee);
  }, [baseFee]);

  const currentGas = selectedFeeOption.gas || '0';

  const displayTx = useMemo(() => {
    if (!memoizedNFTSendAminoTx) return undefined;

    const tx = {
      ...memoizedNFTSendAminoTx,
      fee: {
        amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
        gas: currentGas,
      },
    };
    return safeStringify(tx);
  }, [currentBaseFee, currentGas, memoizedNFTSendAminoTx, selectedFeeOption.denom]);

  const addressInputErrorMessage = useMemo(() => {
    if (recipientAddress) {
      if (isEqualsIgnoringCase(recipientAddress, selectedNFT?.ownerAddress)) {
        return t('pages.wallet.nft-send.$id.Entry.Cosmos.index.invalidAddress');
      }

      if (!addressRegex.test(recipientAddress)) {
        return t('pages.wallet.nft-send.$id.Entry.Cosmos.index.invalidAddress');
      }
    }

    return '';
  }, [addressRegex, recipientAddress, selectedNFT?.ownerAddress, t]);

  const inputMemoErrorMessage = useMemo(() => {
    if (inputMemo) {
      if (gt(getUtf8BytesLength(inputMemo), COSMOS_MEMO_MAX_BYTES)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.memoOverflow');
      }
    }
    return '';
  }, [inputMemo, t]);

  const errorMessage = useMemo(() => {
    if (!selectedNFT) {
      return t('pages.wallet.nft-send.$id.Entry.Cosmos.index.notFoundNFT');
    }

    if (!selectedNFT?.isOwned) {
      return t('pages.wallet.nft-send.$id.Entry.Cosmos.index.notOwnedNFT');
    }

    if (!addressRegex.test(recipientAddress)) {
      return t('pages.wallet.nft-send.$id.Entry.Cosmos.index.invalidAddress');
    }

    if (!selectedNFT?.ownerAddress) {
      return t('pages.wallet.nft-send.$id.Entry.Cosmos.index.invalidOwnerAddress');
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    if (isEqualsIgnoringCase(selectedNFT?.ownerAddress, recipientAddress)) {
      return t('pages.wallet.nft-send.$id.Entry.Cosmos.index.invalidAddress');
    }

    if (gt(currentBaseFee, selectedFeeOption.balance)) {
      return t('pages.wallet.nft-send.$id.Entry.Cosmos.index.insufficientAmount');
    }

    return '';
  }, [addressRegex, currentBaseFee, inputMemoErrorMessage, recipientAddress, selectedFeeOption.balance, selectedNFT, t]);

  useAutoFeeCurrencySelectionOnInit({
    feeAssets: feeAssets,
    isCustomFee: isCustomStep,
    currentFeeStepKey: currentFeeStepKey,
    gas: currentGas,
    setFeeCoinId: (coinId) => {
      setAutoSetFeeCoinId(coinId);
    },
  });

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!chain) {
        throw new Error('Chain not found');
      }

      if (!selectedNFT) {
        throw new Error('NFT not found');
      }

      if (!accountAsset) {
        throw new Error('Account asset not found');
      }

      if (!account.data?.value.account_number) {
        throw new Error('Account number not found');
      }

      if (!memoizedNFTSendAminoTx) {
        throw new Error('Failed to calculate final transaction');
      }

      if (!selectedFeeOption || !selectedFeeOption.denom) {
        throw new Error('Failed to get current fee asset');
      }

      const finalizedTransaction = {
        ...memoizedNFTSendAminoTx,
        fee: {
          amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
          gas: currentGas,
        },
      };

      const keyPair = getKeypair(chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey, 'hex').toString('base64') : '';

      const pTx = protoTx(
        finalizedTransaction,
        [''],
        { type: accountAsset.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: base64PublicKey },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      if (!pTx) {
        throw new Error('Failed to calculate proto transaction');
      }

      const directDoc = {
        chain_id: chain.chainId,
        account_number: account.data.value.account_number,
        auth_info_bytes: [...Array.from(pTx.authInfoBytes)],
        body_bytes: [...Array.from(pTx.txBodyBytes)],
      };

      const requestURLs = chain.lcdUrls.map((item) => cosmosURL(item.url, chain.chainId).postBroadcast()) || [];

      if (!requestURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signDirectAndexecuteTxSequentially({
        privateKey,
        directDoc,
        chain: chain,
        urls: requestURLs,
      });

      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const uniqueChainId = getUniqueChainIdWithManual(chain.id, chain.chainType);
      addTx({
        txHash: response.tx_response.txhash,
        chainId: uniqueChainId,
        address: accountAsset.address.address,
        addedAt: Date.now(),
        retryCount: 0,
        type: 'nft',
      });

      navigate({
        to: TxResult.to,
        search: {
          coinId: accountAssetCoinId,
          txHash: response.tx_response.txhash,
        },
      });
    } catch {
      navigate({
        to: TxResult.to,
        search: {
          coinId: accountAssetCoinId,
        },
      });
    } finally {
      setIsOpenTxProcessingOverlay(false);
    }
  }, [
    account.data?.value.account_number,
    accountAsset,
    accountAssetCoinId,
    addTx,
    chain,
    currentAccount,
    currentBaseFee,
    currentGas,
    currentPassword,
    memoizedNFTSendAminoTx,
    navigate,
    selectedFeeOption,
    selectedNFT,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedNFTSendAminoTx, simulate.isFetching, isLoadingCosmsoNFTs]);

  return (
    <>
      <BaseBody>
        <>
          <NFTContainer>
            <NFTImage src={nftImage} />
            <NFTName variant="h2_B">{nftName}</NFTName>
            <NFTSubname>
              <Typography variant="b4_R">
                {t('pages.wallet.nft-send.$id.Entry.Cosmos.index.contract')}

                <Typography variant="b3_M">{nftContractAddress}</Typography>
              </Typography>
            </NFTSubname>
          </NFTContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={chainList.cosmosChains || []}
              currentChainId={chain && getUniqueChainId(chain)}
              disabled
              label={t('pages.wallet.nft-send.$id.Entry.Cosmos.index.recipientNetwork')}
            />
            <StandardInput
              label={t('pages.wallet.nft-send.$id.Entry.Cosmos.index.recipientAddress')}
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
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.nft-send.$id.Entry.Cosmos.index.memo')}
              error={!!inputMemoErrorMessage}
              helperText={inputMemoErrorMessage}
              value={inputMemo}
              onChange={(e) => setInputMemo(e.target.value)}
            />
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <Fee
            feeOptionDatas={feeOptions}
            availableFeeAssets={feeAssets}
            selectedCustomFeeCoinId={alternativeFeeCoinId}
            currentSelectedFeeOptionKey={currentFeeStepKey}
            errorMessage={errorMessage}
            onChangeGas={(gas) => {
              setCustomGasAmount(gas);
            }}
            onChangeGasRate={(gasRate) => {
              setCustomGasRate(gasRate);
            }}
            onChangeFeeCoinId={(feeCoinId) => {
              setCustomFeeCoinId(feeCoinId);
            }}
            onClickFeeStep={(val) => {
              setInputFeeStepKey(val);
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
          headerTitle={t('pages.wallet.nft-send.$id.Entry.Cosmos.index.chooseRecipientAddress')}
          onClickAddress={(address, memo) => {
            setRecipientAddress(address);
            if (memo) {
              setInputMemo(memo);
            }
          }}
        />
      )}
      <ReviewBottomSheet
        rawTxString={displayTx}
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.nft-send.$id.Entry.Cosmos.index.sendNFTReview')}
        contentsSubTitle={t('pages.wallet.nft-send.$id.Entry.Cosmos.index.sendNFTReviewSub')}
        confirmButtonText={t('pages.wallet.nft-send.$id.Entry.Cosmos.index.sendNFT')}
        onClickConfirm={handleOnClickConfirm}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.nft-send.$id.Entry.Cosmos.index.txProcessing')}
        message={t('pages.wallet.nft-send.$id.Entry.Cosmos.index.txProcessingSub')}
      />
    </>
  );
}
