import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import Base1000Text from '@/components/common/Base1000Text';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import Fee from '@/components/Fee/CosmosFee';
import InformationPanel from '@/components/InformationPanel';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import ValidatorSelectBox from '@/components/ValidatorSelectBox';
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { COSMOS_MEMO_MAX_BYTES } from '@/constants/cosmos/tx';
import { useAccount } from '@/hooks/cosmos/useAccount';
import { useAutoFeeCurrencySelectionOnInit } from '@/hooks/cosmos/useAutoFeeCurrencySelectionOnInit';
import { useDelegationInfo } from '@/hooks/cosmos/useDelegationInfo';
import { useFees } from '@/hooks/cosmos/useFees';
import { useNodeInfo } from '@/hooks/cosmos/useNodeInfo';
import { useSimulate } from '@/hooks/cosmos/useSimulate';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { cosmos } from '@/proto/cosmos-sdk-v0.47.4.js';
import type { MsgReward, SignAminoDoc } from '@/types/cosmos/amino';
import { isTestnetChain } from '@/utils/chain';
import { getCosmosFeeStepNames } from '@/utils/cosmos/fee';
import { protoTx, protoTxBytes } from '@/utils/cosmos/proto';
import { signDirectAndexecuteTxSequentially } from '@/utils/cosmos/sign';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { getDayFromSeconds } from '@/utils/date';
import { ceil, gt, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, getUniqueChainIdWithManual, isMatchingCoinId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { getUtf8BytesLength, isDecimal, isEqualsIgnoringCase, safeStringify, shorterAddress, toPercentages } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

import ValidatorBottomSheet from './components/ValidatorBottomSheet';
import { ChainNameContainer, CoinContainer, CoinImage, CoinSymbolText, Divider, EstimatedValueTextContainer, InputWrapper, LockDateTextSpan } from './styled';

export type UnstakeValidator = {
  validatorName: string;
  validatorAddress: string;
  votingPower: string;
  commission: string;
  stakedAmount: string;
  rewardAmount: string;
  rewardTokenCounts?: string;
  validatorImage?: string;
};

type CosmosProps = {
  coinId: string;
  validatorAddress: string;
};

export default function Cosmos({ coinId, validatorAddress }: CosmosProps) {
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
  const selectedUnstakingCoin = getCosmosAccountAssetFilteredByAccountType();

  const delegationInfo = useDelegationInfo({ coinId });
  const { feeAssets, defaultGasRateKey, isFeemarketActive } = useFees({ coinId: coinId });

  const currentFeeStepKey = useMemo(() => {
    if (inputFeeStepKey !== undefined) {
      return inputFeeStepKey;
    }

    return defaultGasRateKey;
  }, [defaultGasRateKey, inputFeeStepKey]);

  const stakerAddress = useMemo(() => selectedUnstakingCoin?.address.address, [selectedUnstakingCoin?.address.address]);

  const coinImageURL = selectedUnstakingCoin?.asset.image || '';

  const coinSymbol = selectedUnstakingCoin?.asset.symbol
    ? selectedUnstakingCoin.asset.symbol + `${isTestnetChain(selectedUnstakingCoin.chain.id) ? ' (Testnet)' : ''}`
    : '';
  const coinDecimal = selectedUnstakingCoin?.asset.decimals || 0;

  const chainName = selectedUnstakingCoin?.chain.name || '';

  const coinGeckoId = selectedUnstakingCoin?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const baseAvailableAmount = selectedUnstakingCoin?.balance || '0';

  const [displayUnstakeAmount, setDisplayUnstakeAmount] = useState('');

  const baseUnstakeAmount = useMemo(
    () => (displayUnstakeAmount ? toBaseDenomAmount(displayUnstakeAmount, selectedUnstakingCoin?.asset.decimals || 0) : '0'),
    [displayUnstakeAmount, selectedUnstakingCoin?.asset.decimals],
  );
  const displayUnstakeAmountPrice = displayUnstakeAmount ? times(displayUnstakeAmount, coinPrice) : '0';

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);
  const [isOpenValidatorBottomSheet, setIsOpenValidatorBottomSheet] = useState(false);

  const [currentValidaotrAddress, setCurrentValidaotrAddress] = useState(validatorAddress);

  const availableValidators = useMemo<UnstakeValidator[]>(
    () =>
      delegationInfo.delegationInfo
        .map((item) => {
          const votinPower = ceil(toDisplayDenomAmount(item.validatorInfo?.tokens || '0', selectedUnstakingCoin?.asset.decimals || 0));
          const commission = toPercentages(item.validatorInfo?.commission.commission_rates.rate || '0', {
            disableMark: true,
          });

          const rewardAmount = item.rewardInfo?.reward.find((reward) => reward.denom === selectedUnstakingCoin?.asset.id)?.amount || '0';

          const restRewards = item.rewardInfo?.reward.filter((reward) => reward.denom !== selectedUnstakingCoin?.asset.id).length || 0;
          const restRewardCounts = gt(restRewards, '0') ? restRewards.toString() : undefined;

          return {
            validatorName: item.validatorInfo?.description.moniker || shorterAddress(item.validatorAddress, 12) || '',
            validatorAddress: item.validatorAddress,
            votingPower: votinPower,
            commission: commission,
            stakedAmount: item.totalDelegationAmount,
            rewardAmount,
            rewardTokenCounts: restRewardCounts,
            validatorImage: item.validatorInfo?.monikerImage,
            status: item.validatorInfo?.validatorStatus,
          };
        })
        .sort((a, b) => (gt(a.votingPower, b.votingPower) ? -1 : 1)),
    [delegationInfo.delegationInfo, selectedUnstakingCoin?.asset.decimals, selectedUnstakingCoin?.asset.id],
  );

  const currentStakingInfo = useMemo(
    () => delegationInfo.delegationInfo.find((item) => isEqualsIgnoringCase(item.validatorAddress, currentValidaotrAddress)),
    [currentValidaotrAddress, delegationInfo.delegationInfo],
  );

  const availableUnstakeBaseAmount = currentStakingInfo?.totalDelegationAmount || '0';
  const availableUnstakeDisplayAmount = useMemo(
    () => toDisplayDenomAmount(availableUnstakeBaseAmount, selectedUnstakingCoin?.asset.decimals || 0),
    [availableUnstakeBaseAmount, selectedUnstakingCoin?.asset.decimals],
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

  const memoizedUnstakeAminoTx = useMemo<SignAminoDoc<MsgReward> | undefined>(() => {
    if (selectedUnstakingCoin) {
      if (
        account.data?.value.account_number &&
        gt(displayUnstakeAmount || '0', '0') &&
        alternativeFeeAsset?.asset.id &&
        currentValidaotrAddress &&
        stakerAddress
      ) {
        const sequence = String(account.data?.value.sequence || '0');

        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? selectedUnstakingCoin.chain.chainId,
          fee: {
            amount: [
              {
                denom: alternativeFeeAsset.asset.id,
                amount: selectedUnstakingCoin?.chain.isEvm
                  ? times(alternativeGasRate?.[0] || '0', selectedUnstakingCoin.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                  : '1',
              },
            ],
            gas: String(selectedUnstakingCoin.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
          },
          memo: inputMemo,
          msgs: [
            {
              type: 'cosmos-sdk/MsgUndelegate',
              value: {
                delegator_address: stakerAddress,
                validator_address: currentValidaotrAddress,
                amount: { denom: selectedUnstakingCoin.asset.id, amount: baseUnstakeAmount },
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
    baseUnstakeAmount,
    currentValidaotrAddress,
    displayUnstakeAmount,
    inputMemo,
    nodeInfo.data?.default_node_info?.network,
    selectedUnstakingCoin,
    stakerAddress,
  ]);

  const [unstakeAminoTx] = useDebounce(memoizedUnstakeAminoTx, 700);

  const unstakeProtoTx = useMemo(() => {
    if (unstakeAminoTx) {
      const pTx = protoTx(
        unstakeAminoTx,
        [''],
        { type: selectedUnstakingCoin?.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: '' },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [selectedUnstakingCoin?.address.accountType.pubkeyType, unstakeAminoTx]);

  const simulate = useSimulate({ coinId, txBytes: unstakeProtoTx?.tx_bytes });

  const alternativeGas = useMemo(() => {
    const gasCoefficient = selectedUnstakingCoin?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(selectedUnstakingCoin?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    return baseEstimateGas;
  }, [selectedUnstakingCoin?.chain.feeInfo.defaultGasLimit, selectedUnstakingCoin?.chain.feeInfo.gasCoefficient, simulate.data?.gas_info?.gas_used]);

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

  const lockUpPeriod = useMemo(
    () =>
      selectedUnstakingCoin?.chain.isSupportStaking && selectedUnstakingCoin.chain.stakingParams?.unbonding_time
        ? getDayFromSeconds(selectedUnstakingCoin.chain.stakingParams.unbonding_time)
        : '-',
    [selectedUnstakingCoin?.chain.isSupportStaking, selectedUnstakingCoin?.chain.stakingParams?.unbonding_time],
  );

  const displayTx = useMemo(() => {
    if (!memoizedUnstakeAminoTx) return undefined;

    const tx = {
      ...memoizedUnstakeAminoTx,
      fee: {
        amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
        gas: currentGas,
      },
    };

    return safeStringify(tx);
  }, [currentBaseFee, currentGas, memoizedUnstakeAminoTx, selectedFeeOption.denom]);

  const unstakeAmountInputErrorMessage = useMemo(() => {
    if (displayUnstakeAmount) {
      if (gt(displayUnstakeAmount, availableUnstakeDisplayAmount)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.invalidRewardAmount');
      }

      if (!gt(displayUnstakeAmount, '0')) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.tooLowAmount');
      }
    }
    return '';
  }, [availableUnstakeDisplayAmount, displayUnstakeAmount, t]);

  const inputMemoErrorMessage = useMemo(() => {
    if (inputMemo) {
      if (gt(getUtf8BytesLength(inputMemo), COSMOS_MEMO_MAX_BYTES)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.memoOverflow');
      }
    }
    return '';
  }, [inputMemo, t]);

  const errorMessage = useMemo(() => {
    if (!selectedUnstakingCoin?.chain.isSupportStaking) {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.bankLocked');
    }

    if (!gt(baseAvailableAmount, '0')) {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.noAvailableAmount');
    }

    if (!displayUnstakeAmount) {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.noAmount');
    }

    if (unstakeAmountInputErrorMessage) {
      return unstakeAmountInputErrorMessage;
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    if (gt(currentDisplayFeeAmount, toDisplayDenomAmount(selectedFeeOption.balance, selectedFeeOption.decimals))) {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.insufficientFee');
    }

    if (!gt(displayUnstakeAmount, '0')) {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.invalidAmount');
    }

    if (!unstakeAminoTx) {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.failedToCalculateTransaction');
    }

    return '';
  }, [
    baseAvailableAmount,
    currentDisplayFeeAmount,
    displayUnstakeAmount,
    inputMemoErrorMessage,
    selectedFeeOption.balance,
    selectedFeeOption.decimals,
    selectedUnstakingCoin?.chain.isSupportStaking,
    t,
    unstakeAminoTx,
    unstakeAmountInputErrorMessage,
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

  const handleOnClickMax = () => {
    setDisplayUnstakeAmount(availableUnstakeDisplayAmount);
  };

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedUnstakingCoin?.chain) {
        throw new Error('Chain not found');
      }

      if (!account.data?.value.account_number) {
        throw new Error('Account number not found');
      }

      if (!memoizedUnstakeAminoTx) {
        throw new Error('Failed to calculate final transaction');
      }

      if (!selectedFeeOption || !selectedFeeOption.denom) {
        throw new Error('Failed to get current fee asset');
      }

      const finalizedTransaction = {
        ...memoizedUnstakeAminoTx,
        fee: {
          amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
          gas: currentGas,
        },
      };

      const keyPair = getKeypair(selectedUnstakingCoin.chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey, 'hex').toString('base64') : '';

      const pTx = protoTx(
        finalizedTransaction,
        [''],
        { type: selectedUnstakingCoin.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: base64PublicKey },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      if (!pTx) {
        throw new Error('Failed to calculate proto transaction');
      }

      const directDoc = {
        chain_id: selectedUnstakingCoin.chain.chainId,
        account_number: account.data.value.account_number,
        auth_info_bytes: [...Array.from(pTx.authInfoBytes)],
        body_bytes: [...Array.from(pTx.txBodyBytes)],
      };

      const requestURLs = selectedUnstakingCoin?.chain.lcdUrls.map((item) => cosmosURL(item.url, parseCoinId(coinId).chainId).postBroadcast()) || [];

      if (!requestURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signDirectAndexecuteTxSequentially({
        privateKey,
        directDoc,
        chain: selectedUnstakingCoin.chain,
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
        address: selectedUnstakingCoin.address.address,
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
    account.data?.value.account_number,
    addTx,
    coinId,
    currentAccount,
    currentBaseFee,
    currentGas,
    currentPassword,
    memoizedUnstakeAminoTx,
    navigate,
    selectedFeeOption,
    selectedUnstakingCoin?.address.accountType.pubkeyType,
    selectedUnstakingCoin?.address.address,
    selectedUnstakingCoin?.chain,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedUnstakeAminoTx, simulate.isFetching]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstake')}`}</CoinSymbolText>
            <ChainNameContainer>
              <Typography variant="b3_M">
                {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.stakingCoin', {
                  chainName: chainName,
                })}
              </Typography>
            </ChainNameContainer>
          </CoinContainer>

          <InputWrapper>
            <ValidatorSelectBox
              validatorList={availableValidators}
              currentValidatorAddress={currentValidaotrAddress}
              onClickItem={() => {
                setIsOpenValidatorBottomSheet(true);
              }}
              disabled={!!validatorAddress}
              isBottomSheetOpen={isOpenValidatorBottomSheet}
              label={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.validator')}
            />

            <StandardInput
              label={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstakingAmount')}
              error={!!unstakeAmountInputErrorMessage}
              helperText={unstakeAmountInputErrorMessage}
              value={displayUnstakeAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimal || 0) && e.currentTarget.value) {
                  return;
                }

                setDisplayUnstakeAmount(e.currentTarget.value);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isApporximation>
                          {displayUnstakeAmountPrice}
                        </NumberTypo>
                      </EstimatedValueTextContainer>
                    </InputAdornment>
                  ),
                },
              }}
              rightBottomAdornment={
                selectedUnstakingCoin && (
                  <BalanceButton
                    onClick={handleOnClickMax}
                    leftComponent={
                      <Base1000Text variant="b3_R">{`${t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.staked')} :`}</Base1000Text>
                    }
                    coin={selectedUnstakingCoin?.asset}
                    balance={availableUnstakeBaseAmount}
                    variant="zeroAsDash"
                  />
                )
              }
            />
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.memo')}
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
          <InformationPanel
            varitant="info"
            title={<Typography variant="b3_M">{t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.inform')}</Typography>}
            body={
              <Typography variant="b4_R_Multiline">
                {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.informDescription1', {
                  symbol: coinSymbol,
                })}
                <LockDateTextSpan>
                  {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.lockUpPeriod', {
                    lockUpPeriod: lockUpPeriod,
                  })}
                </LockDateTextSpan>
                {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.informDescription2')}
              </Typography>
            }
          />

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
          selectedUnstakingCoin?.asset.symbol
            ? t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstakeReviewWithSymbol', {
                symbol: selectedUnstakingCoin.asset.symbol,
              })
            : t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstakeReview')
        }
        contentsSubTitle={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstakeReviewDescription')}
        confirmButtonText={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstake')}
        onClickConfirm={handleOnClickConfirm}
      />
      <ValidatorBottomSheet
        validatorList={availableValidators}
        open={isOpenValidatorBottomSheet}
        onClose={() => setIsOpenValidatorBottomSheet(false)}
        currentValidatorId={currentValidaotrAddress}
        currentUnstakingCoinId={coinId}
        onClickItem={(validatorAddress) => {
          setCurrentValidaotrAddress(validatorAddress);
        }}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.txProcessing')}
        message={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.txProcessingSub')}
      />
    </>
  );
}
