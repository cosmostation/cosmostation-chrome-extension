import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import type { VersionedTransaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { useNavigate } from '@tanstack/react-router';

import AddressBottomSheet from '@/components/AddressBottomSheet';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import ChainSelectBox from '@/components/ChainSelectBox';
import NumberTypo from '@/components/common/NumberTypo';
import StandardInput from '@/components/common/StandardInput';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton';
import SolanaFee from '@/components/Fee/SolanaFee';
import ReviewBottomSheet from '@/components/ReviewBottomSheet';
import { SOLANA_NATIVE_COIN } from '@/constants/solana';
import { useGetAccountInfo } from '@/hooks/solana/useGetAccountInfo';
import { useGetLatestBlockHash } from '@/hooks/solana/useGetLatestBlockHash';
import { useGetRecentPrioritizationFees } from '@/hooks/solana/useGetRecentPrioritizationFees';
import { useGetRentExemption } from '@/hooks/solana/useGetRentExemption';
import { useSolanaResolveDomain } from '@/hooks/solana/useSolanaNS';
import { useTransactionPreview } from '@/hooks/solana/useTransactionPreview';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { isTestnetChain } from '@/utils/chain';
import { gt, minus, plus, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getUniqueChainId, getUniqueChainIdWithManual, parseCoinId } from '@/utils/queryParamGenerator';
import { SolanaRpcClient } from '@/utils/solana/connection';
import { isSolanaNSDomain } from '@/utils/solana/nameService';
import {
  createSplTokenTransferTransaction,
  createTransferTransaction,
  deserializeTransaction,
  overwriteComputeBudgetProgram,
  parseInstructionsFromTx,
  serializeTransaction,
} from '@/utils/solana/transaction';
import { isValidSolanaAddress } from '@/utils/solana/validation';
import { isDecimal, safeStringify, shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useTxTrackerStore } from '@/zustand/hooks/useTxTrackerStore';

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
} from './styled';
import TxProcessingOverlay from '../components/TxProcessingOverlay';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

const defaultPriorityBaseFee = 500; // Default value for priority base fee in microLamports

type SolanaProps = { coinId: string };

interface ConfirmData {
  transaction: VersionedTransaction | undefined;
  computeUnitLimit?: number;
  computeUnitPrice?: number;
}

export default function Solana({ coinId }: SolanaProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTx } = useTxTrackerStore();

  const { chainId, chainType } = parseCoinId(coinId);

  const [confirmData, setConfirmData] = useState<ConfirmData>({ transaction: undefined });
  const [displayTx, setDisplayTx] = useState<string>('');

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [inputRecipientAddress, setInputRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);
  const [isOpenTxProcessingOverlay, setIsOpenTxProcessingOverlay] = useState(false);

  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const [debouncedInputRecipientAddress] = useDebounce(inputRecipientAddress, 500);
  const [debouncedSendDisplayAmount] = useDebounce(sendDisplayAmount, 500);

  const solanaNs = useSolanaResolveDomain({ coinId, domain: debouncedInputRecipientAddress });

  const recipientAddress = useMemo(() => {
    if (solanaNs.isLoading || solanaNs.isFetching) {
      return isSolanaNSDomain(debouncedInputRecipientAddress) ? '' : debouncedInputRecipientAddress;
    }
    return solanaNs.data || debouncedInputRecipientAddress;
  }, [debouncedInputRecipientAddress, solanaNs.data, solanaNs.isLoading, solanaNs.isFetching]);

  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);

  const nativeCoinId = useMemo(() => getCoinId({ chainId, chainType, id: SOLANA_NATIVE_COIN }), [chainId, chainType]);

  const { getSolanaAccountAsset: getSolanaAccountNativeAsset } = useGetAccountAsset({ coinId: nativeCoinId });
  const nativeCoin = getSolanaAccountNativeAsset();

  const nativeCoinSymbol = nativeCoin?.asset.symbol || '';
  const nativeCoinDecimals = nativeCoin?.asset.decimals || 0;
  const nativeCoinPrice = (nativeCoin?.asset.coinGeckoId && coinGeckoPrice?.[nativeCoin?.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;
  const displayAvailableFeeAmount = toDisplayDenomAmount(nativeCoin?.balance || '0', nativeCoinDecimals);

  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoinToSend = getSolanaAccountAsset();

  const coinImageURL = selectedCoinToSend?.asset.image || '';
  const coinBadgeImageURL = selectedCoinToSend?.asset.type === 'native' ? '' : selectedCoinToSend?.chain.image || '';

  const coinSymbol = selectedCoinToSend?.asset.symbol
    ? selectedCoinToSend.asset.symbol + `${isTestnetChain(selectedCoinToSend.chain.id) ? ' (Testnet)' : ''}`
    : '';
  const coinDenom = selectedCoinToSend?.asset.id || '';
  const shortCoinDenom = shorterAddress(coinDenom, 16);
  const coinDecimals = selectedCoinToSend?.asset.decimals || 0;

  const coinType = useMemo(() => {
    if (selectedCoinToSend?.asset.type === 'spl') {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.mint');
    }

    return '';
  }, [selectedCoinToSend?.asset.type, t]);

  const coinDescription = selectedCoinToSend?.asset.description;

  const coinGeckoId = selectedCoinToSend?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const displaySendAmountPrice = useMemo(
    () => (debouncedSendDisplayAmount ? times(debouncedSendDisplayAmount, coinPrice) : '0'),
    [coinPrice, debouncedSendDisplayAmount],
  );

  const baseSendAmount = useMemo(() => toBaseDenomAmount(debouncedSendDisplayAmount || '0', coinDecimals), [coinDecimals, debouncedSendDisplayAmount]);
  const baseAvailableAmount = selectedCoinToSend?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimals);

  const addressInputErrorMessage = useMemo(() => {
    if (debouncedInputRecipientAddress) {
      if (isSolanaNSDomain(debouncedInputRecipientAddress)) {
        if (!solanaNs.data && !solanaNs.isLoading && !solanaNs.isFetching) {
          return t('pages.wallet.send.$coinId.Entry.Solana.index.invalidSolanaNSAddress');
        }
        return '';
      }

      try {
        new PublicKey(debouncedInputRecipientAddress);
      } catch {
        return t('pages.wallet.send.$coinId.Entry.Solana.index.invalidAddress');
      }
    }

    return '';
  }, [debouncedInputRecipientAddress, solanaNs.data, solanaNs.isLoading, solanaNs.isFetching, t]);

  const { data: latestBlockHash, isFetching: isFetchingGetLatestBlockHash } = useGetLatestBlockHash({ coinId });

  const toATA = useMemo(() => {
    try {
      if (!addressInputErrorMessage && isValidSolanaAddress(recipientAddress) && latestBlockHash) {
        if (selectedCoinToSend?.asset?.type === 'spl') {
          const mint = selectedCoinToSend.asset.id;

          const pubMint = new PublicKey(mint);
          const pubRecipient = new PublicKey(recipientAddress);

          return getAssociatedTokenAddressSync(pubMint, pubRecipient);
        } else {
          return new PublicKey(recipientAddress);
        }
      }
    } catch {
      return undefined;
    }

    return undefined;
  }, [addressInputErrorMessage, latestBlockHash, recipientAddress, selectedCoinToSend?.asset.id, selectedCoinToSend?.asset?.type]);

  const { data: toATAInfo, isFetching: isFetchingGetAccountInfo } = useGetAccountInfo({ coinId, account: toATA });
  const { data: recentPrioritizationFees, isFetching: isFetchingGetRecentPrioritizationFees } = useGetRecentPrioritizationFees({ coinId });
  const { data: rentExemption } = useGetRentExemption({ coinId });

  const sendAmountInputErrorMessage = useMemo(() => {
    if (debouncedSendDisplayAmount) {
      if (gt(baseSendAmount, baseAvailableAmount)) {
        return t('pages.wallet.send.$coinId.Entry.Solana.index.insufficientAmount');
      }

      const isNativeSolFirstTransfer = !toATAInfo && selectedCoinToSend?.asset.id === nativeCoin?.asset.id;
      if (isNativeSolFirstTransfer) {
        if (gt(rentExemption || 0, baseSendAmount)) {
          return t('pages.wallet.send.$coinId.Entry.Solana.index.lowerThanRent', {
            rentAmount: toDisplayDenomAmount(rentExemption || 0, nativeCoinDecimals),
          });
        }
      }
    }

    return '';
  }, [
    baseAvailableAmount,
    baseSendAmount,
    debouncedSendDisplayAmount,
    nativeCoin?.asset.id,
    nativeCoinDecimals,
    rentExemption,
    selectedCoinToSend?.asset.id,
    t,
    toATAInfo,
  ]);

  const transaction = useMemo(() => {
    try {
      if (
        !addressInputErrorMessage &&
        !sendAmountInputErrorMessage &&
        debouncedSendDisplayAmount &&
        debouncedInputRecipientAddress &&
        selectedCoinToSend &&
        latestBlockHash
      ) {
        if (selectedCoinToSend?.asset.type === 'spl') {
          const programId = selectedCoinToSend.chain.programId.splToken;
          const mint = selectedCoinToSend.asset.id;
          const sender = selectedCoinToSend.address.address;

          const tx = createSplTokenTransferTransaction(sender, recipientAddress, mint, Number(baseSendAmount), latestBlockHash.blockhash, {
            isAccountCreationNeeded: !toATAInfo,
            programId,
          });

          return tx;
        }

        const sender = selectedCoinToSend.address.address;

        const tx = createTransferTransaction(sender, recipientAddress, Number(baseSendAmount), latestBlockHash.blockhash);
        return tx;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }, [
    addressInputErrorMessage,
    sendAmountInputErrorMessage,
    debouncedSendDisplayAmount,
    debouncedInputRecipientAddress,
    selectedCoinToSend,
    latestBlockHash,
    recipientAddress,
    baseSendAmount,
    toATAInfo,
  ]);

  const { data: transactionPreview, isFetching: isFetchingTransactionPreview } = useTransactionPreview({ coinId, transaction });

  const priorityBaseFee = useMemo(() => {
    if (recentPrioritizationFees && recentPrioritizationFees.length > 0) {
      return recentPrioritizationFees.reduce((acc, cur) => acc + cur.prioritizationFee, 0) / recentPrioritizationFees.length / 1000000 + defaultPriorityBaseFee;
    }
    return defaultPriorityBaseFee;
  }, [recentPrioritizationFees]);

  const computeUnitLimit = useMemo(() => {
    if (transactionPreview?.simulatedValue?.unitsConsumed) {
      return transactionPreview.simulatedValue.unitsConsumed + 500;
    }
    return undefined;
  }, [transactionPreview?.simulatedValue?.unitsConsumed]);

  const computeUnitPrice = useMemo(() => {
    if (priorityBaseFee && computeUnitLimit) {
      const price = priorityBaseFee / computeUnitLimit;

      return price;
    }

    return undefined;
  }, [priorityBaseFee, computeUnitLimit]);

  const baseFee = useMemo(() => {
    if (transactionPreview?.estimatedValue) {
      if (!toATAInfo && selectedCoinToSend?.asset?.type === 'spl') {
        return Number(plus(rentExemption || 0, transactionPreview.estimatedValue));
      }
      return transactionPreview.estimatedValue;
    }

    return undefined;
  }, [rentExemption, selectedCoinToSend?.asset?.type, toATAInfo, transactionPreview?.estimatedValue]);

  const totalBaseFee = useMemo(() => {
    if (baseFee && priorityBaseFee) {
      return baseFee + priorityBaseFee;
    }
    return undefined;
  }, [baseFee, priorityBaseFee]);

  const displayTotalFee = useMemo(() => {
    if (totalBaseFee) {
      return toDisplayDenomAmount(totalBaseFee, nativeCoinDecimals);
    }
    return undefined;
  }, [totalBaseFee, nativeCoinDecimals]);

  const totalFeePrice = useMemo(() => {
    if (displayTotalFee) {
      return times(displayTotalFee, nativeCoinPrice);
    }
    return undefined;
  }, [displayTotalFee, nativeCoinPrice]);

  const errorMessage = useMemo(() => {
    if (!debouncedSendDisplayAmount) {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.noAmount');
    }

    if (!debouncedInputRecipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.noRecipientAddress');
    }

    if (baseAvailableAmount === '0') {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.noAvailableAmount');
    }

    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (sendAmountInputErrorMessage) {
      return sendAmountInputErrorMessage;
    }

    if (!baseFee || !computeUnitLimit || !computeUnitPrice) {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.noFee');
    }

    if (!transaction) {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.noTx');
    }
  }, [
    addressInputErrorMessage,
    baseAvailableAmount,
    baseFee,
    computeUnitLimit,
    computeUnitPrice,
    debouncedInputRecipientAddress,
    debouncedSendDisplayAmount,
    sendAmountInputErrorMessage,
    t,
    transaction,
  ]);

  const [isMinLoadingTime, setIsMinLoadingTime] = useState(false);

  const isFetchingTxData = useMemo(() => {
    return isFetchingGetAccountInfo || isFetchingGetLatestBlockHash || isFetchingGetRecentPrioritizationFees || isFetchingTransactionPreview;
  }, [isFetchingGetAccountInfo, isFetchingGetLatestBlockHash, isFetchingGetRecentPrioritizationFees, isFetchingTransactionPreview]);

  useEffect(() => {
    if (isFetchingTxData) {
      setIsMinLoadingTime(true);
    } else {
      const timer = setTimeout(() => {
        setIsMinLoadingTime(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFetchingTxData, transaction]);

  const isCalculatingTx = isFetchingTxData || isMinLoadingTime;

  const handleOnClickMax = useCallback(() => {
    const isSendNativeCoin = selectedCoinToSend?.asset.id === selectedCoinToSend?.chain.mainAssetDenom;

    if (isSendNativeCoin) {
      const isBeforeCalcFee = !displayTotalFee;

      if (isBeforeCalcFee) {
        const defaultBaseFee = toDisplayDenomAmount(20000, nativeCoinDecimals);
        const displayAmount = minus(displayAvailableFeeAmount, defaultBaseFee);

        setSendDisplayAmount(displayAmount);
      } else {
        const displayAmount = minus(displayAvailableFeeAmount, displayTotalFee);
        setSendDisplayAmount(displayAmount);
      }
    } else {
      setSendDisplayAmount(displayAvailableAmount);
    }
  }, [
    displayAvailableAmount,
    displayAvailableFeeAmount,
    displayTotalFee,
    nativeCoinDecimals,
    selectedCoinToSend?.asset.id,
    selectedCoinToSend?.chain.mainAssetDenom,
  ]);

  const handleOnClickReview = useCallback(() => {
    if (transactionPreview?.simulatedValue?.unitsConsumed && transaction && typeof baseFee === 'number') {
      setConfirmData({ transaction, computeUnitLimit, computeUnitPrice });

      const clonedTx = deserializeTransaction(serializeTransaction(transaction));

      if (computeUnitLimit && computeUnitPrice) {
        const tx = overwriteComputeBudgetProgram(clonedTx, {
          units: computeUnitLimit,
          microLamports: Math.ceil(computeUnitPrice * 1000000),
        });
        setDisplayTx(safeStringify(parseInstructionsFromTx(tx)) || '');
      }

      setIsOpenReviewBottomSheet(true);
    }
  }, [baseFee, computeUnitLimit, computeUnitPrice, transaction, transactionPreview?.simulatedValue?.unitsConsumed]);

  const handleOnClickConfirm = useCallback(async () => {
    try {
      setIsOpenTxProcessingOverlay(true);
      if (confirmData.transaction && selectedCoinToSend) {
        const currentChain = selectedCoinToSend?.chain;
        const keypair = getKeypair(currentChain, currentAccount, currentPassword);
        const transactionToSend = confirmData.transaction;

        if (confirmData.computeUnitLimit && confirmData.computeUnitPrice) {
          const tx = overwriteComputeBudgetProgram(transactionToSend, {
            units: confirmData.computeUnitLimit,
            microLamports: Math.ceil(confirmData.computeUnitPrice * 1000000),
          });

          tx.sign([{ publicKey: new PublicKey(selectedCoinToSend.address.address), secretKey: Buffer.from(keypair.privateKey, 'hex') }]);

          const requestURL = currentChain.rpcUrls[0].url;

          const connection = SolanaRpcClient.getInstance({ rpcUrl: requestURL }).getConnection();
          const signature = await connection.sendEncodedTransaction(Buffer.from(tx.serialize()).toString('base64'), {
            preflightCommitment: 'confirmed',
          });

          if (!signature) {
            throw new Error('Failed to send transaction');
          }

          const { chainId, chainType } = parseCoinId(coinId);
          const uniqueChainId = getUniqueChainIdWithManual(chainId, chainType);
          addTx({ txHash: signature, chainId: uniqueChainId, address: selectedCoinToSend.address.address, addedAt: Date.now(), retryCount: 0 });

          navigate({ to: TxResult.to, search: { address: recipientAddress, coinId, txHash: signature } });
        }
      }
    } catch {
      navigate({ to: TxResult.to, search: { coinId } });
    } finally {
      setIsOpenTxProcessingOverlay(false);
    }
  }, [
    addTx,
    coinId,
    confirmData.computeUnitLimit,
    confirmData.computeUnitPrice,
    confirmData.transaction,
    currentAccount,
    currentPassword,
    navigate,
    recipientAddress,
    selectedCoinToSend,
  ]);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.Entry.Solana.index.send')}`}</CoinSymbolText>
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
              label={t('pages.wallet.send.$coinId.Entry.Solana.index.recipientNetwork')}
              disabled
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.Entry.Solana.index.recipientAddress')}
              error={!!addressInputErrorMessage}
              helperText={addressInputErrorMessage || shorterAddress(solanaNs.data || undefined, 16) || ''}
              isLoadingHelperText={solanaNs.isLoading}
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
              label={t('pages.wallet.send.$coinId.Entry.Solana.index.amount')}
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
          <SolanaFee
            displayFeeAmount={displayTotalFee}
            displayFeePrice={totalFeePrice}
            coinSymbol={nativeCoinSymbol}
            disableConfirm={isCalculatingTx || !!errorMessage}
            isLoading={isCalculatingTx}
            errorMessage={errorMessage}
            onClickConfirm={handleOnClickReview}
          />
        </>
      </BaseFooter>
      {selectedCoinToSend?.chain && (
        <AddressBottomSheet
          open={isOpenAddressBottomSheet}
          onClose={() => setIsOpenAddressBottomSheet(false)}
          filterAddress={selectedCoinToSend?.address.address}
          chainId={getUniqueChainId(selectedCoinToSend.chain)}
          headerTitle={t('pages.wallet.send.$coinId.Entry.Solana.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setInputRecipientAddress(address);
          }}
        />
      )}
      <ReviewBottomSheet
        rawTxString={displayTx}
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.send.$coinId.Entry.Solana.index.sendReview')}
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.Solana.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.Solana.index.send')}
        onClickConfirm={handleOnClickConfirm}
      />
      <TxProcessingOverlay
        open={isOpenTxProcessingOverlay}
        title={t('pages.wallet.send.$coinId.Entry.Solana.index.txProcessing')}
        message={t('pages.wallet.send.$coinId.Entry.Solana.index.txProcessingSub')}
      />
    </>
  );
}
