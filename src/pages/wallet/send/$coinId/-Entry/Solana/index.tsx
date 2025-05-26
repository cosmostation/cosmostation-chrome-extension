import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { ComputeBudgetProgram, Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

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
import { useTransactionPreview } from '@/hooks/solana/useTransactionPreview';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getKeypair } from '@/libs/address';
import { isTestnetChain } from '@/utils/chain';
import { gt, times, toBaseDenomAmount, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, getUniqueChainId, parseCoinId } from '@/utils/queryParamGenerator';
import { isDecimal, shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

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

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

const defaultPriorityBaseFee = 500; // Default value for priority base fee in microLamports

type SolanaProps = {
  coinId: string;
};

interface ConfirmData {
  transaction: VersionedTransaction | undefined;
  computeUnitLimit?: number;
  computeUnitPrice?: number;
}

export default function Solana({ coinId }: SolanaProps) {
  const { chainId, chainType } = parseCoinId(coinId);

  const [isDisabled, setIsDisabled] = useState(false);

  const [confirmData, setConfirmData] = useState<ConfirmData>({
    transaction: undefined,
  });

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const [inputRecipientAddress, setInputRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);
  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const [debouncedInputRecipientAddress] = useDebounce(inputRecipientAddress, 500);
  const [debouncedSendDisplayAmount] = useDebounce(sendDisplayAmount, 500);

  const recipientAddress = useMemo(() => debouncedInputRecipientAddress, [debouncedInputRecipientAddress]);

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { t } = useTranslation();

  const nativeCoinId = useMemo(() => getCoinId({ chainId, chainType, id: SOLANA_NATIVE_COIN }), [chainId, chainType]);

  const { getSolanaAccountAsset: getSolanaAccountNativeAsset } = useGetAccountAsset({ coinId: nativeCoinId });
  const nativeCoin = getSolanaAccountNativeAsset();

  const nativeCoinSymbol = nativeCoin?.asset.symbol || '';
  const nativeCoinDecimals = nativeCoin?.asset.decimals || 0;
  const nativeCoinPrice = (nativeCoin?.asset.coinGeckoId && coinGeckoPrice?.[nativeCoin?.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

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
    if (selectedCoinToSend?.asset.type === 'spl-token') {
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

  const addressInputErrorMessage = useMemo(() => {
    if (debouncedInputRecipientAddress) {
      try {
        new PublicKey(debouncedInputRecipientAddress);
      } catch {
        return t('pages.wallet.send.$coinId.Entry.Solana.index.invalidAddress');
      }
    }

    return '';
  }, [debouncedInputRecipientAddress, t]);

  const handleOnClickMax = useCallback(() => {
    return;
  }, []);

  const { data: latestBlockHash, isFetching: isFetchingGetLatestBlockHash } = useGetLatestBlockHash({ coinId });

  const sendAmountInputErrorMessage = useMemo(() => {
    if (debouncedSendDisplayAmount) {
      if (gt(baseSendAmount, baseAvailableAmount)) {
        return t('pages.wallet.send.$coinId.Entry.Solana.index.insufficientAmount');
      }
    }

    return '';
  }, [baseAvailableAmount, baseSendAmount, debouncedSendDisplayAmount, t]);

  const toATA = useMemo(() => {
    try {
      if (!addressInputErrorMessage && !sendAmountInputErrorMessage && selectedCoinToSend?.asset?.type === 'spl-token' && latestBlockHash) {
        const mint = selectedCoinToSend.asset.id;

        const pubMint = new PublicKey(mint);
        const pubRecipient = new PublicKey(recipientAddress);

        return getAssociatedTokenAddressSync(pubMint, pubRecipient);
      }
    } catch {
      return undefined;
    }

    return undefined;
  }, [addressInputErrorMessage, latestBlockHash, recipientAddress, selectedCoinToSend?.asset.id, selectedCoinToSend?.asset?.type, sendAmountInputErrorMessage]);

  const { data: toATAInfo, isFetching: isFetchingGetAccountInfo } = useGetAccountInfo({
    coinId,
    account: toATA,
  });

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
        if (selectedCoinToSend?.asset.type === 'spl-token') {
          const programId = selectedCoinToSend.chain.programId.splToken;
          const mint = selectedCoinToSend.asset.id;
          const sender = selectedCoinToSend.address.address;

          const pubProgramId = new PublicKey(programId);

          const pubMint = new PublicKey(mint);
          const pubSender = new PublicKey(sender);
          const pubRecipient = new PublicKey(recipientAddress);

          const fromATA = getAssociatedTokenAddressSync(pubMint, pubSender);
          const toATA = getAssociatedTokenAddressSync(pubMint, pubRecipient);

          const createIx = createAssociatedTokenAccountInstruction(pubSender, toATA, pubRecipient, pubMint);

          const transferInstruction = createTransferInstruction(fromATA, toATA, pubSender, Number(baseSendAmount), [], pubProgramId);

          const messageV0 = new TransactionMessage({
            payerKey: pubSender,
            recentBlockhash: latestBlockHash.blockhash,
            instructions: toATAInfo ? [transferInstruction] : [createIx, transferInstruction],
          }).compileToV0Message();

          return new VersionedTransaction(messageV0);
        }

        const sender = selectedCoinToSend.address.address;

        const pubSender = new PublicKey(sender);
        const pubRecipient = new PublicKey(recipientAddress);

        const transferInstruction = SystemProgram.transfer({ fromPubkey: pubSender, toPubkey: pubRecipient, lamports: Number(baseSendAmount) });

        const messageV0 = new TransactionMessage({
          payerKey: pubSender,
          recentBlockhash: latestBlockHash.blockhash,
          instructions: [transferInstruction],
        }).compileToV0Message();
        return new VersionedTransaction(messageV0);
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

  const { data: recentPrioritizationFees, isFetching: isFetchingGetRecentPrioritizationFees } = useGetRecentPrioritizationFees({ coinId });

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
      return transactionPreview.estimatedValue;
    }

    return undefined;
  }, [transactionPreview?.estimatedValue]);

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

    if (!baseFee) {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.noFee');
    }
  }, [addressInputErrorMessage, baseAvailableAmount, baseFee, debouncedInputRecipientAddress, debouncedSendDisplayAmount, sendAmountInputErrorMessage, t]);

  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isDisabled) {
      setIsDisabled(true);
    }

    if (setTimeoutRef.current) {
      clearTimeout(setTimeoutRef.current);
    }
    setTimeoutRef.current = setTimeout(() => {
      setIsDisabled(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction, isFetchingGetAccountInfo, isFetchingGetLatestBlockHash, isFetchingGetRecentPrioritizationFees, isFetchingTransactionPreview]);

  const reviewOnClick = useCallback(() => {
    if (transactionPreview?.simulatedValue?.unitsConsumed && transaction && typeof baseFee === 'number') {
      setConfirmData({
        transaction: transaction,
        computeUnitLimit,
        computeUnitPrice,
      });
      setIsOpenReviewBottomSheet(true);
    }
  }, [baseFee, computeUnitLimit, computeUnitPrice, transaction, transactionPreview?.simulatedValue?.unitsConsumed]);

  const confirmOnClick = useCallback(async () => {
    if (confirmData.transaction && selectedCoinToSend) {
      const currentChain = selectedCoinToSend?.chain;
      const connection = new Connection(currentChain.rpcUrls[0].url, 'confirmed');
      const keypair = getKeypair(currentChain, currentAccount, currentPassword);
      const transactionToSend = confirmData.transaction;

      if (confirmData.computeUnitLimit && confirmData.computeUnitPrice) {
        const { message } = transactionToSend;

        const computeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({
          units: confirmData.computeUnitLimit,
        });
        const computeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: Math.ceil(confirmData.computeUnitPrice * 1000000),
        });

        const messageWithPriority = new TransactionMessage({
          payerKey: message.staticAccountKeys[0],
          recentBlockhash: message.recentBlockhash,
          instructions: [
            computeUnitIx,
            computeUnitPriceIx,
            ...message.compiledInstructions.map((ix) => ({
              programId: message.staticAccountKeys[ix.programIdIndex],
              keys: ix.accountKeyIndexes.map((i) => {
                const pubkey = message.staticAccountKeys[i];
                const isSigner = message.isAccountSigner(i);
                const isWritable = message.isAccountWritable(i);
                return { pubkey, isSigner, isWritable };
              }),
              data: Buffer.from(ix.data),
            })),
          ],
        }).compileToV0Message();

        const tx = new VersionedTransaction(messageWithPriority);

        tx.sign([{ publicKey: new PublicKey(selectedCoinToSend.address.address), secretKey: Buffer.from(keypair.privateKey, 'hex') }]);

        const signature = await connection.sendRawTransaction(tx.serialize());

        console.log(signature);
      }
    }
  }, [confirmData.computeUnitLimit, confirmData.computeUnitPrice, confirmData.transaction, currentAccount, currentPassword, selectedCoinToSend]);

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
              helperText={addressInputErrorMessage}
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
            disableConfirm={isDisabled || !!errorMessage}
            isLoading={isDisabled}
            errorMessage={errorMessage}
            onClickConfirm={reviewOnClick}
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
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.send.$coinId.Entry.Aptos.index.sendReview')}
        contentsSubTitle={t('pages.wallet.send.$coinId.Entry.Aptos.index.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.Entry.Aptos.index.send')}
        onClickConfirm={confirmOnClick}
      />
    </>
  );
}
