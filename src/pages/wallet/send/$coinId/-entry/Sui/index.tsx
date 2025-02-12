import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { InputAdornment } from '@mui/material';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction, type Transaction as TransactionType } from '@mysten/sui/transactions';
import { isValidSuiAddress } from '@mysten/sui/utils';
import { useNavigate } from '@tanstack/react-router';

import AddressBottomSheet from '@/components/AddressBottomSheet/index.tsx';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import SuiFee from '@/components/Fee/SuiFee/index.tsx';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { DEFAULT_GAS_BUDGET, DEFAULT_GAS_BUDGET_MULTIPLY } from '@/constants/sui/gas.ts';
import { SUI_COIN_TYPE } from '@/constants/sui/index.ts';
import { useDryRunTransaction } from '@/hooks/sui/useDryRunTransaction.ts';
import { useGetCoins } from '@/hooks/sui/useGetCoins.ts';
import { useAccountAssets } from '@/hooks/useAccountAssets.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCurrentAccount } from '@/hooks/useCurrentAccount.ts';
import { useCurrentPassword } from '@/hooks/useCurrentPassword.ts';
import { getKeypair } from '@/libs/address.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result/$txHash/$coinId';

import { gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, getUniqueChainId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { isDecimal, isEqualsIgnoringCase } from '@/utils/string.ts';
import { getCoinType } from '@/utils/sui/coin.ts';
import { signAndExecuteTxSequentially } from '@/utils/sui/sign.ts';
import { toastError } from '@/utils/toast.tsx';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';

import { AddressBookButton, CoinContainer, CoinImage, CoinSymbolText, Divider, EstimatedValueTextContainer, InputWrapper } from './styled.tsx';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';
import TxProcessingOverlay from '../components/TxProcessingOverlay/index.tsx';

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [isDisabled, setIsDisabled] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const { data } = useAccountAssets();

  const parsedCoinId = parseCoinId(coinId);

  const selectedCoinToSend = (() => {
    if (!data) return undefined;

    if (parsedCoinId.chainType === 'sui') {
      return data?.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }
    return undefined;
  })();

  const feeCoinAsset = data?.suiAccountAssets.find(({ asset }) => asset.id === SUI_COIN_TYPE)?.asset;

  const feeCoinDecimals = feeCoinAsset?.decimals || 9;

  const address = selectedCoinToSend?.address.address || '';

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol || getCoinType(selectedCoinToSend?.asset.id || '');
  const coinDecimal = selectedCoinToSend?.asset.decimals || 0;

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimal);

  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const sendBaseAmount = sendDisplayAmount ? toBaseDenomAmount(sendDisplayAmount, coinDecimal) : '0';

  const displaySendAmountPrice = sendDisplayAmount ? times(sendDisplayAmount, coinPrice) : '0';

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const currentCoinType = selectedCoinToSend?.asset.id || '';

  const { data: ownedEqualCoins } = useGetCoins({ coinId, coinType: currentCoinType });

  const sendTx = useMemo<TransactionType | undefined>(() => {
    if (!gt(sendBaseAmount, '0') || !recipientAddress || !isValidSuiAddress(recipientAddress)) {
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

    if (currentCoinType === SUI_COIN_TYPE) {
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

  const [debouncedTx] = useDebounce(sendTx, 700);

  const { data: dryRunTransaction, error: dryRunTransactionError } = useDryRunTransaction({
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

  const addressInputErrorMessage = (() => {
    if (recipientAddress && (!isValidSuiAddress(recipientAddress) || isEqualsIgnoringCase(recipientAddress, selectedCoinToSend?.address.address))) {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.invalidAddress');
    }
    return '';
  })();

  const sendAmountInputErrorMessage = (() => {
    if (sendDisplayAmount && !gt(sendDisplayAmount || '0', '0')) {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.invalidAmount');
    }

    if (sendDisplayAmount && gt(sendDisplayAmount || '0', displayAvailableAmount)) {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.insufficientAmount');
    }

    return '';
  })();

  const errorMessage = useMemo(() => {
    if (!isValidSuiAddress(recipientAddress)) {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.invalidAddress');
    }

    if (isEqualsIgnoringCase(recipientAddress, address)) {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.invalidAddress');
    }

    if (!sendDisplayAmount || !gt(sendDisplayAmount || '0', '0')) {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.invalidAmount');
    }

    if (gt(sendDisplayAmount || '0', displayAvailableAmount)) {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.insufficientAmount');
    }

    if (dryRunTransactionError?.message) {
      const idx = dryRunTransactionError.message.lastIndexOf(':');

      return dryRunTransactionError.message.substring(idx === -1 ? 0 : idx + 1).trim();
    }

    if (dryRunTransaction?.result?.effects.status.error) {
      return dryRunTransaction?.result?.effects.status.error;
    }

    if (dryRunTransaction?.result?.effects.status.status !== 'success') {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.failedToDryRun');
    }

    if (!debouncedTx) {
      return t('pages.wallet.send.$coinId.Entry.Sui.index.failedToBuildTransaction');
    }

    return '';
  }, [
    address,
    debouncedTx,
    displayAvailableAmount,
    dryRunTransaction?.result?.effects.status.error,
    dryRunTransaction?.result?.effects.status.status,
    dryRunTransactionError?.message,
    recipientAddress,
    sendDisplayAmount,
    t,
  ]);

  const handleOnClickMax = () => {
    if (currentCoinType === SUI_COIN_TYPE) {
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

      navigate({
        to: TxResult.to,
        params: {
          coinId,
          txHash: response.digest,
        },
      });
    } catch {
      toastError(t('pages.wallet.send.$coinId.Entry.Sui.index.failedToSend'));
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
  }, [debouncedEnabled, sendTx]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.Entry.Sui.index.send')}`}</CoinSymbolText>
          </CoinContainer>

          <InputWrapper>
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Sui.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
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
              label={t('pages.wallet.send.$coinId.Entry.Sui.index.amount')}
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
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={currency} isApporximation>
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
          <SuiFee
            disableConfirm={!!errorMessage || isDisabled}
            displayFeeAmount={displayExpectedBaseFeeAmount}
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
          headerTitle={t('pages.wallet.send.$coinId.Entry.Sui.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setRecipientAddress(address);
          }}
        />
      )}
      <ReviewBottomSheet
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.send.$coinId.Entry.Sui.index.sendReview')}
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.Sui.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.Sui.index.send')}
        onClickConfirm={handleOnClickConfirm}
      />

      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.Sui.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.Sui.index.txProcessingSub')}
      />
    </>
  );
}
