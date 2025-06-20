import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
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
import { useFees } from '@/hooks/cosmos/useFees';
import { useNodeInfo } from '@/hooks/cosmos/useNodeInfo';
import { useSimulate } from '@/hooks/cosmos/useSimulate';
import { useValidators } from '@/hooks/cosmos/useValidators';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { cosmos } from '@/proto/cosmos-sdk-v0.47.4.js';
import { isTestnetChain } from '@/utils/chain';
import { getCosmosFeeStepNames } from '@/utils/cosmos/fee';
import { protoTx, protoTxBytes } from '@/utils/cosmos/proto';
import { signDirectAndexecuteTxSequentially } from '@/utils/cosmos/sign';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { ceil, divide, fix, gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, getUniqueChainIdWithManual, isMatchingCoinId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { getUtf8BytesLength, isDecimal, isEqualsIgnoringCase, safeStringify, toPercentages } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

import {
  APRText,
  ChainNameContainer,
  CoinContainer,
  CoinImage,
  CoinSymbolText,
  CommissionContainer,
  CommissionTextSpan,
  Divider,
  EstimatedReward,
  EstimatedRewardAmountContainer,
  EstimatedRewardCoin,
  EstimatedRewardCoinImage,
  EstimatedValueTextContainer,
  InputWrapper,
} from './styled';
import ValidatorBottomSheet from '../components/ValidatorBottomSheet';

type CosmosProps = {
  coinId: string;
  validatorAddress?: string;
};

export default function Cosmos({ coinId, validatorAddress }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const account = useAccount({ coinId });
  const nodeInfo = useNodeInfo({ coinId });

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { getCosmosAccountAssetFilteredByAccountType } = useGetAccountAsset({ coinId });
  const validators = useValidators({ coinId });

  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const [isDisabled, setIsDisabled] = useState(false);

  const [inputFeeStepKey, setInputFeeStepKey] = useState<number | undefined>();

  const { feeAssets, defaultGasRateKey, isFeemarketActive } = useFees({ coinId: coinId });

  const currentFeeStepKey = useMemo(() => {
    if (inputFeeStepKey !== undefined) {
      return inputFeeStepKey;
    }

    return defaultGasRateKey;
  }, [defaultGasRateKey, inputFeeStepKey]);

  const [customFeeCoinId, setCustomFeeCoinId] = useState('');
  const [autoSetFeeCoinId, setAutoSetFeeCoinId] = useState('');
  const [customGasAmount, setCustomGasAmount] = useState<string | undefined>();
  const [customGasRate, setCustomGasRate] = useState('');

  const selectedStakingCoin = getCosmosAccountAssetFilteredByAccountType();

  const coinImageURL = selectedStakingCoin?.asset.image || '';

  const coinSymbol = selectedStakingCoin?.asset.symbol
    ? selectedStakingCoin.asset.symbol + `${isTestnetChain(selectedStakingCoin.chain.id) ? ' (Testnet)' : ''}`
    : '';
  const coinDecimal = selectedStakingCoin?.asset.decimals || 0;

  const coinGeckoId = selectedStakingCoin?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const coinDescription = selectedStakingCoin?.asset.description;

  const baseAvailableAmount = selectedStakingCoin?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimal);

  const [displayStakeAmount, setDisplayStakeAmount] = useState('');
  const baseStakeAmount = useMemo(
    () => (displayStakeAmount ? toBaseDenomAmount(displayStakeAmount, selectedStakingCoin?.asset.decimals || 0) : '0'),
    [displayStakeAmount, selectedStakingCoin?.asset.decimals],
  );

  const displaySendAmountPrice = displayStakeAmount ? times(displayStakeAmount, coinPrice) : '0';

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);
  const [isOpenValidatorBottomSheet, setIsOpenValidatorBottomSheet] = useState(false);

  const [currentValidatorAddress, setCurrentValidatorAddress] = useState(validatorAddress || '');

  const stakerAddress = useMemo(() => selectedStakingCoin?.address.address, [selectedStakingCoin?.address.address]);

  const availableValidators = useMemo(
    () =>
      validators.data.map((item) => {
        const votingPower = ceil(toDisplayDenomAmount(item.tokens, selectedStakingCoin?.asset.decimals || 0));
        const commission = toPercentages(item.commission.commission_rates.rate, {
          disableMark: true,
        });

        return {
          validatorName: item.description.moniker,
          validatorAddress: item.operator_address,
          votingPower: votingPower,
          commission: commission,
          validatorImage: item.monikerImage,
          status: item.validatorStatus,
        };
      }),
    [selectedStakingCoin?.asset.decimals, validators.data],
  );

  const currentValidator = useMemo(
    () => availableValidators.find((validator) => isEqualsIgnoringCase(validator.validatorAddress, currentValidatorAddress)),
    [availableValidators, currentValidatorAddress],
  );

  const apr =
    selectedStakingCoin?.chain.apr &&
    toPercentages(selectedStakingCoin.chain.apr, {
      disableMark: true,
    });

  const displayEstimatedMonthlyReward = useMemo(() => {
    if (!apr || !displayStakeAmount || !currentValidator) return undefined;
    const aprRate = times(apr, '0.01');
    const commisionRate = times(currentValidator.commission, '0.01');

    const realAprAfterCommission = times(aprRate, minus(1, commisionRate));

    const annualReward = times(displayStakeAmount, realAprAfterCommission);

    const monthlyReward = divide(annualReward, 12);

    return monthlyReward;
  }, [apr, currentValidator, displayStakeAmount]);

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

  const memoizedStakeAminoTx = useMemo(() => {
    if (selectedStakingCoin) {
      if (
        account.data?.value.account_number &&
        gt(displayStakeAmount || '0', '0') &&
        alternativeFeeAsset?.asset.id &&
        currentValidatorAddress &&
        stakerAddress
      ) {
        const sequence = String(account.data?.value.sequence || '0');

        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? selectedStakingCoin.chain.chainId,
          fee: {
            amount: [
              {
                denom: alternativeFeeAsset.asset.id,
                amount: selectedStakingCoin?.chain.isEvm
                  ? times(alternativeGasRate?.[0] || '0', selectedStakingCoin.chain.feeInfo.defaultGasLimit || COSMOS_DEFAULT_GAS, 0)
                  : '1',
              },
            ],
            gas: String(selectedStakingCoin.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS,
          },
          memo: inputMemo,
          msgs: [
            {
              type: 'cosmos-sdk/MsgDelegate',
              value: {
                delegator_address: stakerAddress,
                validator_address: currentValidatorAddress,
                amount: { denom: selectedStakingCoin.asset.id, amount: baseStakeAmount },
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
    baseStakeAmount,
    currentValidatorAddress,
    displayStakeAmount,
    inputMemo,
    nodeInfo.data?.default_node_info?.network,
    selectedStakingCoin,
    stakerAddress,
  ]);

  const [stakeAminoTx] = useDebounce(memoizedStakeAminoTx, 700);

  const stakeProtoTx = useMemo(() => {
    if (stakeAminoTx) {
      const pTx = protoTx(
        stakeAminoTx,
        [''],
        { type: selectedStakingCoin?.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: '' },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      return pTx ? protoTxBytes({ ...pTx }) : null;
    }
    return null;
  }, [selectedStakingCoin?.address.accountType.pubkeyType, stakeAminoTx]);

  const simulate = useSimulate({ coinId, txBytes: stakeProtoTx?.tx_bytes });

  const alternativeGas = useMemo(() => {
    const gasCoefficient = selectedStakingCoin?.chain.feeInfo.gasCoefficient || DEFAULT_GAS_MULTIPLY;
    const simulatedGas = simulate.data?.gas_info?.gas_used ? times(simulate.data.gas_info.gas_used, gasCoefficient, 0) : undefined;

    const baseEstimateGas = simulatedGas || String(selectedStakingCoin?.chain.feeInfo.defaultGasLimit) || COSMOS_DEFAULT_GAS;

    return baseEstimateGas;
  }, [selectedStakingCoin?.chain.feeInfo.defaultGasLimit, selectedStakingCoin?.chain.feeInfo.gasCoefficient, simulate.data?.gas_info?.gas_used]);

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

  const selectedFeeOption = useMemo(() => {
    return feeOptions[currentFeeStepKey];
  }, [currentFeeStepKey, feeOptions]);

  const isCustomStep = useMemo(() => {
    if (!alternativeGasRate || feeOptions.length === 0) return false;
    return feeOptions.length - 1 === currentFeeStepKey;
  }, [alternativeGasRate, currentFeeStepKey, feeOptions.length]);

  const currentGas = selectedFeeOption.gas || '0';

  const baseFee = useMemo(() => times(currentGas, selectedFeeOption.gasRate || '0'), [currentGas, selectedFeeOption.gasRate]);

  const currentBaseFee = useMemo(() => {
    return ceil(baseFee);
  }, [baseFee]);
  const currentDisplayFeeAmount = useMemo(() => toDisplayDenomAmount(currentBaseFee, selectedFeeOption.decimals), [currentBaseFee, selectedFeeOption.decimals]);

  const currentFeeCoinDisplayAvailableAmount = useMemo(
    () => toDisplayDenomAmount(selectedFeeOption?.balance || '0', selectedFeeOption?.decimals || 0),
    [selectedFeeOption?.balance, selectedFeeOption.decimals],
  );

  const displayTx = useMemo(() => {
    if (!memoizedStakeAminoTx) return undefined;

    const tx = {
      ...memoizedStakeAminoTx,
      fee: {
        amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
        gas: currentGas,
      },
    };

    return safeStringify(tx);
  }, [currentBaseFee, currentGas, memoizedStakeAminoTx, selectedFeeOption.denom]);

  const stakeAmountInputErrorMessage = useMemo(() => {
    if (displayStakeAmount) {
      if (selectedStakingCoin?.asset.id === selectedFeeOption?.denom) {
        const displayTotalCostAmount = plus(displayStakeAmount, currentDisplayFeeAmount);
        const displayAvailableFeeAmount = toDisplayDenomAmount(selectedStakingCoin?.balance || '0', selectedStakingCoin?.asset.decimals || 0);

        if (gt(displayTotalCostAmount, displayAvailableFeeAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Cosmos.index.insufficientAmount');
        }
      } else {
        if (gt(displayStakeAmount, displayAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Cosmos.index.insufficientAmount');
        }
      }

      if (!gt(displayStakeAmount, '0')) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.tooLowAmount');
      }
    }
    return '';
  }, [
    currentDisplayFeeAmount,
    displayAvailableAmount,
    displayStakeAmount,
    selectedFeeOption?.denom,
    selectedStakingCoin?.asset.decimals,
    selectedStakingCoin?.asset.id,
    selectedStakingCoin?.balance,
    t,
  ]);

  const inputMemoErrorMessage = useMemo(() => {
    if (inputMemo) {
      if (gt(getUtf8BytesLength(inputMemo), COSMOS_MEMO_MAX_BYTES)) {
        return t('pages.wallet.send.$coinId.Entry.Cosmos.index.memoOverflow');
      }
    }
    return '';
  }, [inputMemo, t]);

  const errorMessage = useMemo(() => {
    if (!selectedStakingCoin?.chain.isSupportStaking) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.bankLocked');
    }

    if (!gt(baseAvailableAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.noAvailableAmount');
    }

    if (!displayStakeAmount) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.noAmount');
    }

    if (stakeAmountInputErrorMessage) {
      return stakeAmountInputErrorMessage;
    }

    if (gt(currentDisplayFeeAmount, currentFeeCoinDisplayAvailableAmount)) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.insufficientFee');
    }

    if (!gt(displayStakeAmount, '0')) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.invalidAmount');
    }

    if (inputMemoErrorMessage) {
      return inputMemoErrorMessage;
    }

    if (!stakeAminoTx) {
      return t('pages.wallet.send.$coinId.Entry.Cosmos.index.failedToCalculateTransaction');
    }

    return '';
  }, [
    baseAvailableAmount,
    currentDisplayFeeAmount,
    currentFeeCoinDisplayAvailableAmount,
    displayStakeAmount,
    inputMemoErrorMessage,
    selectedStakingCoin?.chain.isSupportStaking,
    stakeAminoTx,
    stakeAmountInputErrorMessage,
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

  const handleOnClickMax = () => {
    if (selectedStakingCoin && selectedFeeOption && selectedStakingCoin?.asset.id === selectedFeeOption.denom) {
      const maxAmount = minus(displayAvailableAmount, currentDisplayFeeAmount);

      setDisplayStakeAmount(gt(maxAmount, '0') ? maxAmount : '0');
    } else {
      setDisplayStakeAmount(displayAvailableAmount);
    }
  };

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedStakingCoin?.chain) {
        throw new Error('Chain not found');
      }

      if (!account.data?.value.account_number) {
        throw new Error('Account number not found');
      }

      if (!memoizedStakeAminoTx) {
        throw new Error('Failed to calculate final transaction');
      }

      if (!selectedFeeOption || !selectedFeeOption.denom) {
        throw new Error('Failed to get current fee asset');
      }

      const finalizedTransaction = {
        ...memoizedStakeAminoTx,
        fee: {
          amount: [{ denom: selectedFeeOption.denom, amount: currentBaseFee }],
          gas: currentGas,
        },
      };

      const keyPair = getKeypair(selectedStakingCoin.chain, currentAccount, currentPassword);
      const privateKey = keyPair.privateKey;

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey, 'hex').toString('base64') : '';

      const pTx = protoTx(
        finalizedTransaction,
        [''],
        { type: selectedStakingCoin.address.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey', value: base64PublicKey },
        cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
      );

      if (!pTx) {
        throw new Error('Failed to calculate proto transaction');
      }

      const directDoc = {
        chain_id: selectedStakingCoin.chain.chainId,
        account_number: account.data.value.account_number,
        auth_info_bytes: [...Array.from(pTx.authInfoBytes)],
        body_bytes: [...Array.from(pTx.txBodyBytes)],
      };

      const requestURLs = selectedStakingCoin?.chain.lcdUrls.map((item) => cosmosURL(item.url, parseCoinId(coinId).chainId).postBroadcast()) || [];

      if (!requestURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signDirectAndexecuteTxSequentially({
        privateKey,
        directDoc,
        chain: selectedStakingCoin.chain,
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
        address: selectedStakingCoin.address.address,
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
    memoizedStakeAminoTx,
    navigate,
    selectedFeeOption,
    selectedStakingCoin?.address.accountType.pubkeyType,
    selectedStakingCoin?.address.address,
    selectedStakingCoin?.chain,
  ]);

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, memoizedStakeAminoTx, simulate.isFetching]);

  useEffect(() => {
    if (!currentValidatorAddress && availableValidators.length > 0) {
      const cosmostationValidator = availableValidators.find((validator) => validator.validatorName.toLocaleLowerCase().includes('cosmostation'));

      if (cosmostationValidator) {
        setCurrentValidatorAddress(cosmostationValidator.validatorAddress);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableValidators]);
  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.stake.$coinId.entry.stake')}`}</CoinSymbolText>
            <ChainNameContainer>
              <Typography variant="b3_M">{coinDescription}</Typography>
            </ChainNameContainer>
          </CoinContainer>

          <InputWrapper>
            <ValidatorSelectBox
              validatorList={availableValidators}
              currentValidatorAddress={currentValidatorAddress}
              onClickItem={() => {
                setIsOpenValidatorBottomSheet(true);
              }}
              isBottomSheetOpen={isOpenValidatorBottomSheet}
              label={t('pages.wallet.stake.$coinId.entry.validator')}
              rightAdornmentComponent={
                currentValidator && (
                  <CommissionContainer>
                    <Base1000Text variant="b3_R">
                      {`${t('pages.wallet.stake.$coinId.entry.commission')} : `}
                      <CommissionTextSpan>
                        <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={2}>
                          {currentValidator.commission}
                        </NumberTypo>
                      </CommissionTextSpan>
                    </Base1000Text>
                    &nbsp;
                    <Base1300Text variant="h7n_R">{'%'}</Base1300Text>
                  </CommissionContainer>
                )
              }
            />

            <StandardInput
              label={t('pages.wallet.stake.$coinId.entry.stakingAmount')}
              error={!!stakeAmountInputErrorMessage}
              helperText={stakeAmountInputErrorMessage}
              value={displayStakeAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimal || 0) && e.currentTarget.value) {
                  return;
                }

                setDisplayStakeAmount(e.currentTarget.value);
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
                selectedStakingCoin && <BalanceButton onClick={handleOnClickMax} coin={selectedStakingCoin?.asset} balance={baseAvailableAmount} />
              }
            />
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.stake.$coinId.entry.memo')}
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
            title={<Typography variant="b3_M">{t('pages.wallet.stake.$coinId.entry.inform')}</Typography>}
            body={
              <Typography variant="b4_R_Multiline">
                {t('pages.wallet.stake.$coinId.entry.inform1', {
                  symbol: coinSymbol,
                })}
                &nbsp;
                <APRText variant="b4_R_Multiline">
                  {t('pages.wallet.stake.$coinId.entry.inform2', {
                    apr: apr ? fix(apr, 2) : 'unknown',
                  })}
                </APRText>
              </Typography>
            }
          >
            <Divider />
            <EstimatedReward>
              <EstimatedRewardCoin>
                <EstimatedRewardCoinImage src={coinImageURL} />
                <Base1300Text variant="b3_M">{coinSymbol}</Base1300Text>
              </EstimatedRewardCoin>
              <EstimatedRewardAmountContainer>
                <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={coinDecimal}>
                  {displayEstimatedMonthlyReward}
                </NumberTypo>
              </EstimatedRewardAmountContainer>
            </EstimatedReward>
          </InformationPanel>
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
            errorMessage={errorMessage}
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
          selectedStakingCoin?.asset.symbol
            ? t('pages.wallet.stake.$coinId.entry.stakeReviewWithSymbol', {
                symbol: selectedStakingCoin.asset.symbol,
              })
            : t('pages.wallet.stake.$coinId.entry.stakeReview')
        }
        contentsSubTitle={t('pages.wallet.stake.$coinId.entry.stakeReviewSub')}
        confirmButtonText={t('pages.wallet.stake.$coinId.entry.stake')}
        onClickConfirm={handleOnClickConfirm}
      />
      <ValidatorBottomSheet
        validatorList={availableValidators}
        open={isOpenValidatorBottomSheet}
        onClose={() => setIsOpenValidatorBottomSheet(false)}
        currentValidatorId={currentValidatorAddress}
        onClickItem={(validatorAddress) => {
          setCurrentValidatorAddress(validatorAddress);
        }}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.stake.$coinId.entry.txProcessing')}
        message={t('pages.wallet.stake.$coinId.entry.txProcessingSub')}
      />
    </>
  );
}
