import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import AddressBottomSheet from '@/components/AddressBottomSheet';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import ChainSelectBox from '@/components/ChainSelectBox';
import NumberTypo from '@/components/common/NumberTypo';
import StandardInput from '@/components/common/StandardInput';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton';
import SolanaFee from '@/components/Fee/SolanaFee';
import { SOLANA_NATIVE_COIN } from '@/constants/solana';
import { useGetAccountInfo } from '@/hooks/solana/useGetAccountInfo';
import { useGetLatestBlockHash } from '@/hooks/solana/useGetLatestBlockHash';
import { useGetRecentPrioritizationFees } from '@/hooks/solana/useGetRecentPrioritizationFees';
import { useTransactionPreview } from '@/hooks/solana/useTransactionPreview';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
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

type SolanaProps = {
  coinId: string;
};

export default function Solana({ coinId }: SolanaProps) {
  const { chainId, chainType } = parseCoinId(coinId);

  const [inputRecipientAddress, setInputRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);

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

  const coinType = (() => {
    if (selectedCoinToSend?.asset.type === 'spl-token') {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.mint');
    }

    return '';
  })();

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

  const { data: latestBlockHash } = useGetLatestBlockHash({ coinId });

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

  const { data: toATAInfo } = useGetAccountInfo({
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

  const { data: transactionPreview } = useTransactionPreview({ coinId, transaction });

  const { data: recentPrioritizationFees } = useGetRecentPrioritizationFees({ coinId });

  const priorityBaseFee = useMemo(() => {
    if (recentPrioritizationFees && transactionPreview?.simulatedValue.unitsConsumed) {
      const averagePrioritizationFee =
        recentPrioritizationFees.reduce((acc, cur) => {
          return acc + cur.prioritizationFee;
        }, 0) / recentPrioritizationFees.length;

      const microLamports = transactionPreview.simulatedValue.unitsConsumed * averagePrioritizationFee;

      const lamports = Math.ceil(microLamports / 1000000) + 1;

      return lamports;
    }

    return undefined;
  }, [recentPrioritizationFees, transactionPreview?.simulatedValue.unitsConsumed]);

  const baseFee = useMemo(() => {
    if (transactionPreview?.estimatedValue && priorityBaseFee) {
      return transactionPreview.estimatedValue + priorityBaseFee;
    }

    return undefined;
  }, [transactionPreview?.estimatedValue, priorityBaseFee]);

  const displayFee = useMemo(() => {
    if (baseFee) {
      return toDisplayDenomAmount(baseFee, nativeCoinDecimals);
    }
    return undefined;
  }, [baseFee, nativeCoinDecimals]);

  const feePrice = useMemo(() => {
    if (displayFee) {
      return times(displayFee, nativeCoinPrice);
    }
    return undefined;
  }, [displayFee, nativeCoinPrice]);

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

  useEffect(() => {
    console.log('nativeCoin', nativeCoin);
  });

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
            displayFeeAmount={displayFee}
            displayFeePrice={feePrice}
            coinSymbol={nativeCoinSymbol}
            disableConfirm={!!errorMessage}
            isLoading={false}
            errorMessage={errorMessage}
            onClickConfirm={() => {
              console.log('onClickConfirm');
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
          headerTitle={t('pages.wallet.send.$coinId.Entry.Solana.index.chooseRecipientAddress')}
          onClickAddress={(address) => {
            setInputRecipientAddress(address);
          }}
        />
      )}
    </>
  );
}
