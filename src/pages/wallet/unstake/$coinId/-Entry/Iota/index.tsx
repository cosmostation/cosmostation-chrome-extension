import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { Transaction, type Transaction as TransactionType } from '@iota/iota-sdk/transactions';
import { IOTA_SYSTEM_STATE_OBJECT_ID, isValidIotaObjectId } from '@iota/iota-sdk/utils';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import IotaFee from '@/components/Fee/IotaFee';
import InformationPanel from '@/components/InformationPanel';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { DEFAULT_GAS_BUDGET, DEFAULT_GAS_BUDGET_MULTIPLY } from '@/constants/iota/gas';
import { useDelegations } from '@/hooks/iota/useDelegations';
import { useDryRunTransaction } from '@/hooks/iota/useDryRunTransaction';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import TxProcessingOverlay from '@/pages/wallet/send/$coinId/-Entry/components/TxProcessingOverlay';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { signAndExecuteTxSequentially } from '@/utils/iota/sign';
import { gt, minus, plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getUniqueChainIdWithManual, parseCoinId } from '@/utils/queryParamGenerator';
import { safeStringify } from '@/utils/string';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

import UnstakeObjectBottomSheet from './components/UnstakeObjectBottomSheet';
import UnstakeObjectSelectBox from './components/UnstakeObjectSelectBox';
import { ChainNameContainer, CoinContainer, CoinImage, CoinSymbolText, Divider } from './styled';

type IotaProps = {
  coinId: string;
  objectId?: string;
};

export default function Iota({ coinId, objectId }: IotaProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  const selectedUnstakingCoin = getIotaAccountAsset();
  const currentStakerAddress = useMemo(() => selectedUnstakingCoin?.address.address || '', [selectedUnstakingCoin?.address.address]);

  const { activeDelegationDetails } = useDelegations({ coinId });

  const coinImageURL = selectedUnstakingCoin?.asset.image || '';

  const coinSymbol = selectedUnstakingCoin?.asset.symbol || '';
  const coinDecimal = selectedUnstakingCoin?.asset.decimals || 0;

  const chainName = selectedUnstakingCoin?.chain.name || '';

  const baseAvailableAmount = selectedUnstakingCoin?.balance || '0';

  const [isDisabled, setIsDisabled] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const [isOpenObjectBottomSheet, setIsOpenObjectBottomSheet] = useState(false);

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);
  const [currentUnstakeObjectId, setCurrentUnstakeObjectId] = useState(objectId);

  const availableUnstakeObjects = useMemo(() => (activeDelegationDetails ? [...activeDelegationDetails] : []), [activeDelegationDetails]);

  const currentUnstakeObject = useMemo(() => {
    return availableUnstakeObjects?.find((item) => item.objectId === currentUnstakeObjectId);
  }, [availableUnstakeObjects, currentUnstakeObjectId]);

  const unstakeTx = useMemo<TransactionType | undefined>(() => {
    if (!currentUnstakeObjectId || !isValidIotaObjectId(currentUnstakeObjectId) || !currentStakerAddress) {
      return undefined;
    }

    const tx = new Transaction();
    tx.setSenderIfNotSet(currentStakerAddress);

    tx.moveCall({
      target: '0x3::iota_system::request_withdraw_stake',
      arguments: [tx.object(IOTA_SYSTEM_STATE_OBJECT_ID), tx.object(currentUnstakeObjectId)],
    });

    return tx;
  }, [currentStakerAddress, currentUnstakeObjectId]);

  const [debouncedTx] = useDebounce(unstakeTx, 200);

  const {
    data: dryRunTransaction,
    error: dryRunTransactionError,
    isLoading: isDryRunTransactionLoading,
    isFetching: isDryRunTransactionFetching,
  } = useDryRunTransaction({
    coinId,
    transaction: debouncedTx,
  });

  const expectedBaseFeeAmount = useMemo(() => {
    if (dryRunTransaction?.result?.effects.status.status === 'success') {
      const storageCost = minus(dryRunTransaction.result.effects.gasUsed.storageCost, dryRunTransaction.result.effects.gasUsed.storageRebate);

      const cost = plus(dryRunTransaction.result.effects.gasUsed.computationCost, gt(storageCost, 0) ? storageCost : 0);

      const baseBudget = Number(times(cost, DEFAULT_GAS_BUDGET_MULTIPLY));

      return baseBudget;
    }

    return DEFAULT_GAS_BUDGET;
  }, [
    dryRunTransaction?.result?.effects.gasUsed.computationCost,
    dryRunTransaction?.result?.effects.gasUsed.storageCost,
    dryRunTransaction?.result?.effects.gasUsed.storageRebate,
    dryRunTransaction?.result?.effects.status.status,
  ]);

  const displayExpectedBaseFeeAmount = useMemo(() => toDisplayDenomAmount(expectedBaseFeeAmount, coinDecimal), [coinDecimal, expectedBaseFeeAmount]);

  const displayTx = useMemo(() => safeStringify(debouncedTx?.getData()), [debouncedTx]);

  const errorMessage = useMemo(() => {
    if (!currentUnstakeObject) {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.noObject');
    }

    if (gt(expectedBaseFeeAmount, baseAvailableAmount)) {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.insufficientFee');
    }

    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      return dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim();
    }

    if (dryRunTransaction?.result?.effects.status.error) {
      return dryRunTransaction?.result?.effects.status.error;
    }

    if (dryRunTransaction?.result?.effects.status.status !== 'success') {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.failedToDryRun');
    }

    if (!debouncedTx) {
      return t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.failedToBuildTransaction');
    }

    return '';
  }, [
    baseAvailableAmount,
    currentUnstakeObject,
    debouncedTx,
    dryRunTransaction?.result?.effects.status.error,
    dryRunTransaction?.result?.effects.status.status,
    dryRunTransactionError?.message,
    expectedBaseFeeAmount,
    t,
  ]);

  const handleOnClickConfirm = async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedUnstakingCoin?.chain) {
        throw new Error('Chain not found');
      }

      if (!debouncedTx) {
        throw new Error('Transaction not found');
      }

      const keyPair = getKeypair(selectedUnstakingCoin.chain, currentAccount, currentPassword);
      const privateKey = Buffer.from(keyPair.privateKey, 'hex');

      const signer = Ed25519Keypair.fromSecretKey(privateKey);
      const rpcURLs = selectedUnstakingCoin?.chain.rpcUrls.map((item) => item.url) || [];

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
        address: selectedUnstakingCoin.address.address,
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
  }, [debouncedEnabled, unstakeTx, isDryRunTransactionLoading, isDryRunTransactionFetching]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.unstake')}`}</CoinSymbolText>
            <ChainNameContainer>
              <Typography variant="b3_M">
                {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.stakingCoin', {
                  chainName: chainName,
                })}
              </Typography>
            </ChainNameContainer>
          </CoinContainer>
          <UnstakeObjectSelectBox
            contentData={currentUnstakeObject}
            disabled={!!objectId}
            isOpenBottomSheet={isOpenObjectBottomSheet}
            onClick={() => {
              setIsOpenObjectBottomSheet(true);
            }}
          />
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <InformationPanel
            varitant="info"
            title={<Typography variant="b3_M">{t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.inform')}</Typography>}
            body={
              <Typography variant="b4_R_Multiline">
                {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.informDescription', {
                  symbol: coinSymbol,
                })}
              </Typography>
            }
          />

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
          selectedUnstakingCoin?.asset.symbol
            ? t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.unstakeReviewWithSymbol', {
                symbol: selectedUnstakingCoin.asset.symbol,
              })
            : t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.unstakeReview')
        }
        contentsSubTitle={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.unstakeReviewDescription')}
        confirmButtonText={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.unstake')}
        onClickConfirm={handleOnClickConfirm}
      />
      <UnstakeObjectBottomSheet
        objects={availableUnstakeObjects}
        open={isOpenObjectBottomSheet}
        onClose={() => setIsOpenObjectBottomSheet(false)}
        currentObjectId={currentUnstakeObjectId}
        onClickItem={(selectedObjectId) => {
          setCurrentUnstakeObjectId(selectedObjectId);
        }}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.txProcessing')}
        message={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Iota.index.txProcessingSub')}
      />
    </>
  );
}
