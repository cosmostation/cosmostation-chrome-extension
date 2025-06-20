import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { Transaction, type Transaction as TransactionType } from '@iota/iota-sdk/transactions';
import { IOTA_SYSTEM_STATE_OBJECT_ID, isValidIotaAddress } from '@iota/iota-sdk/utils';
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
import IotaFee from '@/components/Fee/IotaFee';
import InformationPanel from '@/components/InformationPanel';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import ValidatorSelectBox from '@/components/ValidatorSelectBox';
import { DEFAULT_GAS_BUDGET, DEFAULT_GAS_BUDGET_MULTIPLY } from '@/constants/iota/gas';
import { useDryRunTransaction } from '@/hooks/iota/useDryRunTransaction';
import { useGetAPY } from '@/hooks/iota/useGetAPY';
import { useGetLatestIotaSystemState } from '@/hooks/iota/useGetLatestIotaSystemState';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { signAndExecuteTxSequentially } from '@/utils/iota/sign';
import { ceil, divide, gt, gte, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getUniqueChainIdWithManual, parseCoinId } from '@/utils/queryParamGenerator';
import { isDecimal, isEqualsIgnoringCase, safeStringify, toPercentages } from '@/utils/string.ts';
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

type IotaProps = {
  coinId: string;
  validatorAddress?: string;
};

export default function Iota({ coinId, validatorAddress }: IotaProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  const latestIotaSystemState = useGetLatestIotaSystemState({ coinId });
  const { data: iotaAPY } = useGetAPY({ coinId });

  const [isDisabled, setIsDisabled] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const selectedStakingCoin = getIotaAccountAsset();

  const currentStakerAddress = selectedStakingCoin?.address.address || '';

  const coinImageURL = selectedStakingCoin?.asset.image || '';

  const coinSymbol = selectedStakingCoin?.asset.symbol || '';
  const coinDecimal = selectedStakingCoin?.asset.decimals || 0;

  const coinGeckoId = selectedStakingCoin?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const coinDescription = selectedStakingCoin?.asset.description;

  const baseAvailableAmount = selectedStakingCoin?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimal);

  const [displayStakeAmount, setDisplayStakeAmount] = useState('');
  const baseStakeAmount = displayStakeAmount ? toBaseDenomAmount(displayStakeAmount, coinDecimal) : '0';

  const displaySendAmountPrice = displayStakeAmount ? times(displayStakeAmount, coinPrice) : '0';

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);
  const [isOpenValidatorBottomSheet, setIsOpenValidatorBottomSheet] = useState(false);

  const [currentValidatorAddress, setCurrentValidatorAddress] = useState(validatorAddress || '');

  const availableValidators = useMemo(() => {
    return latestIotaSystemState.data?.result?.activeValidators
      .map((validator) => {
        const commission = divide(validator.commissionRate, 100);
        const votingPower = ceil(toDisplayDenomAmount(validator.stakingPoolIotaBalance, selectedStakingCoin?.asset.decimals || 0));
        const apr = toPercentages(String(iotaAPY?.result?.apys.find((item) => isEqualsIgnoringCase(item.address, validator.iotaAddress))?.apy || 0), {
          fixed: 2,
          disableMark: true,
        });

        return {
          validatorName: validator.name,
          validatorAddress: validator.iotaAddress,
          votingPower: votingPower,
          commission: commission,
          validatorImage: validator.imageUrl,
          apr,
        };
      })
      .sort((a, b) => (gt(a.votingPower, b.votingPower) ? -1 : 1))
      .sort((a) => (a.validatorName.toLocaleLowerCase().includes('cosmostation') ? -1 : 1));
  }, [latestIotaSystemState.data?.result?.activeValidators, selectedStakingCoin?.asset.decimals, iotaAPY?.result?.apys]);

  const currentValidator = useMemo(
    () => availableValidators?.find((validator) => isEqualsIgnoringCase(validator.validatorAddress, currentValidatorAddress)),
    [availableValidators, currentValidatorAddress],
  );

  const stakeTx = useMemo<TransactionType | undefined>(() => {
    if (!gt(baseStakeAmount, '0') || !currentValidator || !isValidIotaAddress(currentValidatorAddress) || !currentStakerAddress) {
      return undefined;
    }
    const tx = new Transaction();
    tx.setSenderIfNotSet(currentStakerAddress);

    const stakeCoin = tx.splitCoins(tx.gas, [BigInt(baseStakeAmount)]);
    tx.moveCall({
      target: '0x3::iota_system::request_add_stake',
      arguments: [
        tx.sharedObjectRef({
          objectId: IOTA_SYSTEM_STATE_OBJECT_ID,
          initialSharedVersion: 1,
          mutable: true,
        }),
        stakeCoin,
        tx.pure.address(currentValidatorAddress),
      ],
    });

    return tx;
  }, [baseStakeAmount, currentStakerAddress, currentValidator, currentValidatorAddress]);

  const [debouncedTx] = useDebounce(stakeTx, 300);

  const {
    data: dryRunTransaction,
    error: dryRunTransactionError,
    isLoading: isDryRunTransactionLoading,
    isFetching: isDryRunTransactionFetching,
  } = useDryRunTransaction({
    coinId,
    transaction: debouncedTx,
  });

  const expectedBaseFeeAmount = (() => {
    if (dryRunTransaction?.result?.effects.status.status === 'success') {
      const storageCost = minus(dryRunTransaction.result.effects.gasUsed.storageCost, dryRunTransaction.result.effects.gasUsed.storageRebate);

      const cost = plus(dryRunTransaction.result.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

      const baseBudget = Number(times(cost, DEFAULT_GAS_BUDGET_MULTIPLY));

      return baseBudget;
    }

    return DEFAULT_GAS_BUDGET;
  })();

  const displayExpectedBaseFeeAmount = toDisplayDenomAmount(expectedBaseFeeAmount, coinDecimal);

  const displayEstimatedMonthlyReward = useMemo(() => {
    if (!currentValidator?.apr || !displayStakeAmount || !currentValidator) return undefined;
    const aprRate = times(currentValidator.apr, '0.01');
    const commisionRate = times(currentValidator.commission, '0.01');

    const realAprAfterCommission = times(aprRate, minus(1, commisionRate));

    const annualReward = times(displayStakeAmount, realAprAfterCommission);

    const monthlyReward = divide(annualReward, 12);

    return monthlyReward;
  }, [currentValidator, displayStakeAmount]);

  const displayTx = useMemo(() => safeStringify(debouncedTx?.getData()), [debouncedTx]);

  const stakeAmountInputErrorMessage = (() => {
    if (displayStakeAmount) {
      const totalCostAmount = plus(displayStakeAmount, displayExpectedBaseFeeAmount);

      if (gt(totalCostAmount, displayAvailableAmount)) {
        return t('pages.wallet.stake.$coinId.entry.insufficientBalance');
      }

      if (!gt(displayStakeAmount, '0')) {
        return t('pages.wallet.stake.$coinId.entry.tooLowAmount');
      }

      if (!gte(displayStakeAmount, '1')) {
        return t('pages.wallet.stake.$coinId.entry.tooSmallToStake');
      }
    }

    return '';
  })();

  const errorMessage = useMemo(() => {
    if (!currentValidator) {
      return t('pages.wallet.stake.$coinId.entry.noValidator');
    }

    if (!displayStakeAmount) {
      return t('pages.wallet.stake.$coinId.entry.noAmount');
    }

    if (stakeAmountInputErrorMessage) {
      return stakeAmountInputErrorMessage;
    }

    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      return dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim();
    }

    if (dryRunTransaction?.result?.effects.status.error) {
      return dryRunTransaction?.result?.effects.status.error;
    }

    if (dryRunTransaction?.result?.effects.status.status !== 'success') {
      return t('pages.wallet.stake.$coinId.entry.failedToDryRun');
    }

    if (!debouncedTx) {
      return t('pages.wallet.stake.$coinId.entry.failedToBuildTransaction');
    }

    return '';
  }, [
    currentValidator,
    debouncedTx,
    displayStakeAmount,
    dryRunTransaction?.result?.effects.status.error,
    dryRunTransaction?.result?.effects.status.status,
    dryRunTransactionError?.message,
    stakeAmountInputErrorMessage,
    t,
  ]);

  const handleOnClickMax = () => {
    const maxAmount = minus(displayAvailableAmount, displayExpectedBaseFeeAmount);

    setDisplayStakeAmount(gt(maxAmount, '0') ? maxAmount : '0');
  };

  const handleOnClickConfirm = async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedStakingCoin?.chain) {
        throw new Error('Chain not found');
      }

      if (!debouncedTx) {
        throw new Error('Transaction not found');
      }

      const keyPair = getKeypair(selectedStakingCoin.chain, currentAccount, currentPassword);
      const privateKey = Buffer.from(keyPair.privateKey, 'hex');

      const signer = Ed25519Keypair.fromSecretKey(privateKey);
      const rpcURLs = selectedStakingCoin?.chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signAndExecuteTxSequentially(signer, debouncedTx, rpcURLs);
      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const { chainId, chainType } = parseCoinId(coinId);
      const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
      addTx({
        txHash: response.digest,
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
          txHash: response.digest,
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
  };

  const debouncedEnabled = useDebouncedCallback(() => {
    setTimeout(() => {
      setIsDisabled(false);
    }, 700);
  }, 700);

  useEffect(() => {
    setIsDisabled(true);

    debouncedEnabled();
  }, [debouncedEnabled, stakeTx, isDryRunTransactionLoading, isDryRunTransactionFetching]);

  useEffect(() => {
    if (!currentValidatorAddress && !!availableValidators?.length) {
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
              validatorList={availableValidators || []}
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
                    apr: currentValidator?.apr,
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
          <IotaFee
            displayFeeAmount={displayExpectedBaseFeeAmount}
            disableConfirm={!!errorMessage || isDisabled}
            isLoading={isDisabled}
            errorMessage={errorMessage}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
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
