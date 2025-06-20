import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { Transaction, type Transaction as TransactionType } from '@iota/iota-sdk/transactions';
import { isValidIotaAddress } from '@iota/iota-sdk/utils';
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
import IotaFee from '@/components/Fee/IotaFee/index.tsx';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { DEFAULT_GAS_BUDGET, DEFAULT_GAS_BUDGET_MULTIPLY } from '@/constants/iota/gas.ts';
import { IOTA_COIN_TYPE } from '@/constants/iota/index.ts';
import { useDryRunTransaction } from '@/hooks/iota/useDryRunTransaction.ts';
import { useGetCoins } from '@/hooks/iota/useGetCoins.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount.ts';
import { useCurrentPassword } from '@/hooks/useCurrentPassword.ts';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset.ts';
import { getKeypair } from '@/libs/address.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { getCoinType } from '@/utils/iota/coin.ts';
import { signAndExecuteTxSequentially } from '@/utils/iota/sign.ts';
import { gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getUniqueChainId, getUniqueChainIdWithManual, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { isDecimal, isEqualsIgnoringCase, safeStringify } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore.ts';

import {
  AddressBookButton,
  CoinContainer,
  CoinImage,
  CoinSymbolText,
  DescriptionContainer,
  Divider,
  EstimatedValueTextContainer,
  InputWrapper,
} from './styled.tsx';
import TxProcessingOverlay from '../components/TxProcessingOverlay/index.tsx';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type IotaProps = {
  coinId: string;
};

export default function Iota({ coinId }: IotaProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isDisabled, setIsDisabled] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoinToSend = getIotaAccountAsset();

  const { getIotaAccountAsset: getIotaAccountMainAsset } = useGetAccountAsset({ coinId: IOTA_COIN_TYPE });

  const feeCoinAsset = getIotaAccountMainAsset()?.asset;

  const feeCoinDecimals = feeCoinAsset?.decimals || 9;

  const address = selectedCoinToSend?.address.address || '';

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol || getCoinType(selectedCoinToSend?.asset.id || '');
  const coinDecimal = selectedCoinToSend?.asset.decimals || 0;

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimal);

  const coinDescription = selectedCoinToSend?.asset.description;

  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const sendBaseAmount = sendDisplayAmount ? toBaseDenomAmount(sendDisplayAmount, coinDecimal) : '0';

  const displaySendAmountPrice = sendDisplayAmount ? times(sendDisplayAmount, coinPrice) : '0';

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const currentCoinType = selectedCoinToSend?.asset.id || '';

  const { data: ownedEqualCoins } = useGetCoins({ coinId, coinType: currentCoinType });

  const sendTx = useMemo<TransactionType | undefined>(() => {
    if (!gt(sendBaseAmount, '0') || !recipientAddress || !isValidIotaAddress(recipientAddress)) {
      return undefined;
    }
    const tx = new Transaction();

    tx.setSenderIfNotSet(address);

    const filteredOwnedEqualCoins =
      ownedEqualCoins
        ?.map((item) => item.result?.data)
        .filter((item) => !!item)
        .flat() || [];

    const [primaryCoin, ...mergeCoins] = filteredOwnedEqualCoins?.filter((coin) => coin.coinType === currentCoinType) || [];

    if (currentCoinType === IOTA_COIN_TYPE) {
      const [coin] = tx.splitCoins(tx.gas, [sendBaseAmount]);

      tx.transferObjects([coin], recipientAddress);
    } else if (primaryCoin) {
      const primaryCoinInput = tx.object(primaryCoin.coinObjectId);
      if (mergeCoins.length) {
        tx.mergeCoins(
          primaryCoinInput,
          mergeCoins.map((coin) => tx.object(coin.coinObjectId)),
        );
      }
      const coin = tx.splitCoins(primaryCoinInput, [sendBaseAmount]);
      tx.transferObjects([coin], recipientAddress);
    }

    return tx;
  }, [address, currentCoinType, ownedEqualCoins, recipientAddress, sendBaseAmount]);

  const [debouncedTx] = useDebounce(sendTx, 500);

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

  const displayExpectedBaseFeeAmount = toDisplayDenomAmount(expectedBaseFeeAmount, feeCoinDecimals);

  const displayTx = useMemo(() => safeStringify(debouncedTx?.getData()), [debouncedTx]);

  const addressInputErrorMessage = (() => {
    if (recipientAddress && (!isValidIotaAddress(recipientAddress) || isEqualsIgnoringCase(recipientAddress, selectedCoinToSend?.address.address))) {
      return t('pages.wallet.send.$coinId.Entry.Iota.index.invalidAddress');
    }
    return '';
  })();

  const sendAmountInputErrorMessage = (() => {
    if (sendDisplayAmount) {
      if (currentCoinType === IOTA_COIN_TYPE) {
        const totalCostAmount = plus(sendDisplayAmount, displayExpectedBaseFeeAmount);

        if (gt(totalCostAmount, displayAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Iota.index.insufficientAmount');
        }
      } else {
        if (gt(sendBaseAmount, baseAvailableAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Iota.index.insufficientAmount');
        }
      }

      if (!gt(sendDisplayAmount, '0')) {
        return t('pages.wallet.send.$coinId.Entry.Iota.index.tooLowAmount');
      }
    }

    return '';
  })();

  const errorMessage = useMemo(() => {
    if (!recipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.Iota.index.noRecipientAddress');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (!sendDisplayAmount) {
      return t('pages.wallet.send.$coinId.Entry.Iota.index.noAmount');
    }

    if (sendAmountInputErrorMessage) {
      return sendAmountInputErrorMessage;
    }

    if (gt(sendDisplayAmount || '0', displayAvailableAmount)) {
      return t('pages.wallet.send.$coinId.Entry.Iota.index.insufficientAmount');
    }

    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      return dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim();
    }

    if (dryRunTransaction?.result?.effects.status.error) {
      return dryRunTransaction?.result?.effects.status.error;
    }

    if (dryRunTransaction?.result?.effects.status.status !== 'success') {
      return t('pages.wallet.send.$coinId.Entry.Iota.index.failedToDryRun');
    }

    if (!debouncedTx) {
      return t('pages.wallet.send.$coinId.Entry.Iota.index.failedToBuildTransaction');
    }

    return '';
  }, [
    addressInputErrorMessage,
    debouncedTx,
    displayAvailableAmount,
    dryRunTransaction?.result?.effects.status.error,
    dryRunTransaction?.result?.effects.status.status,
    dryRunTransactionError?.message,
    recipientAddress,
    sendAmountInputErrorMessage,
    sendDisplayAmount,
    t,
  ]);

  const handleOnClickMax = () => {
    if (currentCoinType === IOTA_COIN_TYPE) {
      const displayAmount = minus(displayAvailableAmount, displayExpectedBaseFeeAmount);
      setSendDisplayAmount(gt(displayAmount, '0') ? displayAmount : '0');
    } else {
      setSendDisplayAmount(displayAvailableAmount);
    }
  };

  const handleOnClickConfirm = async () => {
    try {
      setIsOpenTxProcessingOverlay(true);

      if (!selectedCoinToSend?.chain) {
        throw new Error('Chain not found');
      }

      if (!debouncedTx) {
        throw new Error('Transaction not found');
      }

      const keyPair = getKeypair(selectedCoinToSend.chain, currentAccount, currentPassword);
      const privateKey = Buffer.from(keyPair.privateKey, 'hex');

      const signer = Ed25519Keypair.fromSecretKey(privateKey);
      const rpcURLs = selectedCoinToSend?.chain.rpcUrls.map((item) => item.url) || [];

      if (!rpcURLs.length) {
        throw new Error('RPC URLs not found');
      }

      const response = await signAndExecuteTxSequentially(signer, debouncedTx, rpcURLs);
      if (!response) {
        throw new Error('Failed to send transaction');
      }

      const { chainId, chainType } = parseCoinId(coinId);
      const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
      addTx({ txHash: response.digest, chainId: uniqueChainId, address: selectedCoinToSend.address.address, addedAt: Date.now(), retryCount: 0 });

      navigate({
        to: TxResult.to,
        search: {
          address: recipientAddress,
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
  }, [debouncedEnabled, sendTx, isDryRunTransactionLoading, isDryRunTransactionFetching]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.Entry.Iota.index.send')}`}</CoinSymbolText>

            <DescriptionContainer>
              <Typography variant="b3_M">{coinDescription}</Typography>
            </DescriptionContainer>
          </CoinContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={selectedCoinToSend?.chain ? [selectedCoinToSend?.chain] : []}
              currentChainId={selectedCoinToSend?.chain && getUniqueChainId(selectedCoinToSend?.chain)}
              disableSortChain
              label={t('pages.wallet.send.$coinId.Entry.Iota.index.recipientNetwork')}
              disabled
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Iota.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
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
              label={t('pages.wallet.send.$coinId.Entry.Iota.index.amount')}
              error={!!sendAmountInputErrorMessage}
              helperText={sendAmountInputErrorMessage}
              value={sendDisplayAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimal || 0) && e.currentTarget.value) {
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
          <IotaFee
            displayFeeAmount={displayExpectedBaseFeeAmount}
            disableConfirm={!!errorMessage || isDisabled}
            isLoading={isDisabled}
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
          />
        </>
      </BaseFooter>
      {selectedCoinToSend?.chain && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          filterAddress={selectedCoinToSend?.address.address}
          chainId={getUniqueChainId(selectedCoinToSend.chain)}
          headerTitle={t('pages.wallet.send.$coinId.Entry.Iota.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setRecipientAddress(address);
          }}
        />
      )}
      <ReviewBottomSheet
        rawTxString={displayTx}
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={
          selectedCoinToSend?.asset.symbol
            ? t('pages.wallet.send.$coinId.Entry.Iota.index.sendReviewWithSymbol', {
                symbol: selectedCoinToSend.asset.symbol,
              })
            : t('pages.wallet.send.$coinId.Entry.Iota.index.sendReview')
        }
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.Iota.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.Iota.index.send')}
        onClickConfirm={handleOnClickConfirm}
      />

      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.Iota.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.Iota.index.txProcessingSub')}
      />
    </>
  );
}
