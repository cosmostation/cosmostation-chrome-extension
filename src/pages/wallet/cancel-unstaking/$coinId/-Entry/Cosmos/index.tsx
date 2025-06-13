import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import Fee from '@/components/Fee/CosmosFee';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import ValidatorSelectBox from '@/components/ValidatorSelectBox';
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { COSMOS_MEMO_MAX_BYTES } from '@/constants/cosmos/tx';
import { useAccount } from '@/hooks/cosmos/useAccount';
import { useAutoFeeCurrencySelectionOnInit } from '@/hooks/cosmos/useAutoFeeCurrencySelectionOnInit';
import { useFees } from '@/hooks/cosmos/useFees';
import { useNodeInfo } from '@/hooks/cosmos/useNodeInfo';
import { useSimulate } from '@/hooks/cosmos/useSimulate';
import { useUndelegation } from '@/hooks/cosmos/useUndelegation';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { cosmos } from '@/proto/cosmos-sdk-v0.47.4.js';
import type { MsgCancelUnbondingDelegation, SignAminoDoc } from '@/types/cosmos/amino';
import { isTestnetChain } from '@/utils/chain';
import { getCosmosFeeStepNames } from '@/utils/cosmos/fee';
import { protoTx, protoTxBytes } from '@/utils/cosmos/proto';
import { signDirectAndexecuteTxSequentially } from '@/utils/cosmos/sign';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { ceil, gt, times, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, getUniqueChainIdWithManual, isMatchingCoinId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { getUtf8BytesLength, isEqualsIgnoringCase, safeStringify, shorterAddress, toPercentages } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

import { ChainNameContainer, CoinContainer, CoinImage, CoinSymbolText, Divider, EstimatedValueTextContainer, InputWrapper } from './styled';

type CosmosProps = {
  coinId: string;
  validatorAddress: string;
  amount: string;
  creationHeight: string;
};

export default function Cosmos({ coinId, validatorAddress, creationHeight, amount }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const [isDisabled, setIsDisabled] = useState(false);

  const [inputFeeStepKey, setInputFeeStepKey] = useState<number | undefined>();

  const [customFeeCoinId, setCustomFeeCoinId] = useState('');
  const [autoSetFeeCoinId, setAutoSetFeeCoinId] = useState('');
  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();
  const [customGasRate, setCustomGasRate] = useState('');

  const account = useAccount({ coinId });
  const nodeInfo = useNodeInfo({ coinId });

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { getCosmosAccountAssetFilteredByAccountType } = useGetAccountAsset({ coinId });
  const selectedCancelUnstakeCoin = getCosmosAccountAssetFilteredByAccountType();

  const undelegation = useUndelegation({ coinId });
  const { feeAssets, defaultGasRateKey, isFeemarketActive } = useFees({ coinId: coinId });

  const currentFeeStepKey = useMemo(() => {
    if (inputFeeStepKey !== undefined) {
      return inputFeeStepKey;
    }

    return defaultGasRateKey;
  }, [defaultGasRateKey, inputFeeStepKey]);

  const currentCancelUnstaking = useMemo(() => {
    return undelegation.data.find(
      (item) =>
        isEqualsIgnoringCase(item.validator_address, validatorAddress) && item.entries.creation_height === creationHeight && item.entries.balance === amount,
    );
  }, [amount, creationHeight, undelegation.data, validatorAddress]);

  const baseCancelUnstakeAmount = currentCancelUnstaking?.entries.balance || '0';
  const displayCancelUnstakeAmount = toDisplayDenomAmount(baseCancelUnstakeAmount, selectedCancelUnstakeCoin?.asset.decimals || 0);

  const stakerAddress = useMemo(() => currentCancelUnstaking?.delegator_address, [currentCancelUnstaking?.delegator_address]);

  const coinImageURL = selectedCancelUnstakeCoin?.asset.image || '';

  const coinSymbol = selectedCancelUnstakeCoin?.asset.symbol
    ? selectedCancelUnstakeCoin.asset.symbol + `${isTestnetChain(selectedCancelUnstakeCoin.chain.id) ? ' (Testnet)' : ''}`
    : '';

  const chainName = selectedCancelUnstakeCoin?.chain.name || '';

  const coinGeckoId = selectedCancelUnstakeCoin?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const displayCancelUnstakeAmountPrice = times(coinPrice, displayCancelUnstakeAmount, 0);

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const availableValidators = useMemo(
    () =>
      undelegation.data
        .map((item) => {
          const votinPower = ceil(toDisplayDenomAmount(item.validatorInfo?.tokens || '0', selectedCancelUnstakeCoin?.asset.decimals || 0));
          const commission = toPercentages(item.validatorInfo?.commission.commission_rates.rate || '0', {
            disableMark: true,
          });

          return {
            validatorName: item.validatorInfo?.description.moniker || shorterAddress(item.validator_address, 12) || '',
            validatorAddress: item.validator_address,
            votingPower: votinPower,
            commission: commission,
            validatorImage: item.validatorInfo?.monikerImage,
            status: item.validatorInfo?.validatorStatus,
          };
        })
        .sort((a, b) => (gt(a.votingPower, b.votingPower) ? -1 : 1)),
    [selectedCancelUnstakeCoin?.asset.decimals, undelegation.data],
  );

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

  const memoizedCancelUnstakeAminoTx = useMemo<SignAminoDoc<MsgCancelUnbondingDelegation> | undefined>(() => {
    if (selectedCancelUnstakeCoin) {
      if (
        account.data?.value.account_number &&
        gt(displayCancelUnstakeAmount || '0', '0') &&
        alternativeFeeAsset?.asset.id &&
        currentCancelUnstaking &&
        stakerAddress
      ) {
        const sequence = String(account.data?.value.sequence || '0');

        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? selectedCancelUnstakeCoin.chain.chainId,
          fee: {
            amount: [
              {
                denom: alternativeFeeAsset.asset.id,
                amount: selectedCancelUnstakeCoin?.chain.isEvm
                  ? times(alternativeGasRate?.[0] || '0', selectedCancelUnstakeCoin.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                  : '1',
              },
            ],
            gas: String(selectedCancelUnstakeCoin.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
          },
          memo: inputMemo,
          msgs: [
            {
              type: 'cosmos-sdk/MsgCancelUnbondingDelegation',
              value: {
                delegator_address: stakerAddress,
                validator_address: currentCancelUnstaking.validator_address,
                amount: { denom: selectedCancelUnstakeCoin.asset.id, amount: currentCancelUnstaking.entries.balance },
                creation_height: Number(currentCancelUnstaking.entries.creation_height),
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
    alternativeFeeAsset?.asset.id,
    alternativeGasRate,
    currentCancelUnstaking,
    displayCancelUnstakeAmount,
    inputMemo,
    nodeInfo.data?.default_node_info?.network,
    selectedCancelUnstakeCoin,
    stakerAddress,
  ]);

  const [cancelUnstakeAminoTx] = useDebounce(memoizedCancelUnstakeAminoTx, 700);

  const cancelUnstakeProtoTx = useMemo(() => {
    if (cancelUnstakeAminoTx) {
      const pTx = protoTx(
        cancelUnstakeAminoTx,
        [''],
        { type: selectedCancelUnstakeCoin?.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: '' },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [selectedCancelUnstakeCoin?.address.accountType.pubkeyType, cancelUnstakeAminoTx]);

  const simulate = useSimulate({ coinId, txBytes: cancelUnstakeProtoTx?.tx_bytes });

  const alternativeGas = useMemo(() => {
    const gasCoefficient = selectedCancelUnstakeCoin?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(selectedCancelUnstakeCoin?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    return baseEstimateGas;
  }, [selectedCancelUnstakeCoin?.chain.feeInfo.defaultGasLimit, selectedCancelUnstakeCoin?.chain.feeInfo.gasCoefficient, simulate.data?.gas_info?.gas_used]);

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

  const currentBaseFee = useMemo(() => {
    const baseFee = times(selectedFeeOption.gas || '0', selectedFeeOption.gasRate || '0');

    return ceil(baseFee);
  }, [selectedFeeOption.gas, selectedFeeOption.gasRate]);

  const currentDisplayFeeAmount = useMemo(() => toDisplayDenomAmount(currentBaseFee, selectedFeeOption.decimals), [currentBaseFee, selectedFeeOption.decimals]);

  const currentGas = selectedFeeOption.gas || '0';

  const displayTx = useMemo(() => {
    if (!memoizedCancelUnstakeAminoTx) return undefined;

    const tx = {
      ...memoizedCancelUnstakeAminoTx,
      fee: {
        amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
        gas: currentGas,
      },
    };
    return safeStringify(tx);
  }, [currentBaseFee, currentGas, memoizedCancelUnstakeAminoTx, selectedFeeOption.denom]);

  const inputMemoErrorMessage = useMemo(() => {
    if (inputMemo) {
      if (gt(getUtf8BytesLength(inputMemo), COSMOS_MEMO_MAX_BYTES)) {
        return t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.memoOverflow');
      }
    }
    return '';
  }, [inputMemo, t]);

  const errorMessage = useMemo(() => {
    if (!selectedCancelUnstakeCoin?.chain.isSupportStaking) {
      return t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.bankLocked');
    }

    if (gt(currentDisplayFeeAmount, toDisplayDenomAmount(selectedFeeOption.balance, selectedFeeOption.decimals))) {
      return t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.insufficientFee');
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    if (!cancelUnstakeAminoTx) {
      return t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.failedToCalculateTransaction');
    }

    return '';
  }, [
    cancelUnstakeAminoTx,
    currentDisplayFeeAmount,
    inputMemoErrorMessage,
    selectedCancelUnstakeCoin?.chain.isSupportStaking,
    selectedFeeOption.balance,
    selectedFeeOption.decimals,
    t,
  ]);

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

      if (!selectedCancelUnstakeCoin?.chain) {
        throw new Error('Chain not found');
      }

      if (!account.data?.value.account_number) {
        throw new Error('Account number not found');
      }

      if (!memoizedCancelUnstakeAminoTx) {
        throw new Error('Failed to calculate final transaction');
      }

      if (!selectedFeeOption || !selectedFeeOption.denom) {
        throw new Error('Failed to get current fee asset');
      }

      const finalizedTransaction = {
        ...memoizedCancelUnstakeAminoTx,
        fee: {
          amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
          gas: currentGas,
        },
      };

      const keyPair = getKeypair(selectedCancelUnstakeCoin.chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey, 'hex').toString('base64') : '';

      const pTx = protoTx(
        finalizedTransaction,
        [''],
        { type: selectedCancelUnstakeCoin.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: base64PublicKey },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      if (!pTx) {
        throw new Error('Failed to calculate proto transaction');
      }

      const directDoc = {
        chain_id: selectedCancelUnstakeCoin.chain.chainId,
        account_number: account.data.value.account_number,
        auth_info_bytes: [...Array.from(pTx.authInfoBytes)],
        body_bytes: [...Array.from(pTx.txBodyBytes)],
      };

      const requestURLs = selectedCancelUnstakeCoin?.chain.lcdUrls.map((item) => cosmosURL(item.url, parseCoinId(coinId).chainId).postBroadcast()) || [];

      if (!requestURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signDirectAndexecuteTxSequentially({
        privateKey,
        directDoc,
        chain: selectedCancelUnstakeCoin.chain,
        urls: requestURLs,
      });

      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const { chainId, chainType } = parseCoinId(coinId);
      const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
      addTx({
        txHash: response.tx_response.txhash,
        chainId: uniqueChainId,
        address: selectedCancelUnstakeCoin.address.address,
        addedAt: Date.now(),
        retryCount: 0,
        type: 'staking',
      });

      navigate({
        to: TxResult.to,
        search: {
          coinId,
          txHash: response.tx_response.txhash,
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
    selectedCancelUnstakeCoin?.chain,
    selectedCancelUnstakeCoin?.address.accountType.pubkeyType,
    selectedCancelUnstakeCoin?.address.address,
    account.data?.value.account_number,
    memoizedCancelUnstakeAminoTx,
    selectedFeeOption,
    currentBaseFee,
    currentGas,
    currentAccount,
    currentPassword,
    coinId,
    addTx,
    navigate,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedCancelUnstakeAminoTx, simulate.isFetching]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} />
            <CoinSymbolText variant="h2_B">
              {t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.cancelUnstake', {
                symbol: coinSymbol,
              })}
            </CoinSymbolText>
            <ChainNameContainer>
              <Typography variant="b3_M">
                {t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.stakingCoin', {
                  chainName: chainName,
                })}
              </Typography>
            </ChainNameContainer>
          </CoinContainer>

          <InputWrapper>
            <ValidatorSelectBox
              validatorList={availableValidators}
              currentValidatorAddress={currentCancelUnstaking?.validator_address}
              disabled
              label={t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.validator')}
            />

            <StandardInput
              label={t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.cancelUnstakingAmount')}
              value={displayCancelUnstakeAmount}
              disabled
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isApporximation>
                          {displayCancelUnstakeAmountPrice}
                        </NumberTypo>
                      </EstimatedValueTextContainer>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.memo')}
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
      <ReviewBottomSheet
        rawTxString={displayTx}
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={
          selectedCancelUnstakeCoin?.asset.symbol
            ? t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.cancelUnstakeReviewWithSymbol', {
                symbol: selectedCancelUnstakeCoin.asset.symbol,
              })
            : t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.cancelUnstakeReview')
        }
        contentsSubTitle={t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.cancelUnstakeReviewDescription')}
        confirmButtonText={t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.cancelUnstakeConfirm')}
        onClickConfirm={handleOnClickConfirm}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.txProcessing')}
        message={t('pages.wallet.cancel-unstaking.$coinId.Entry.Cosmos.index.txProcessingSub')}
      />
    </>
  );
}
