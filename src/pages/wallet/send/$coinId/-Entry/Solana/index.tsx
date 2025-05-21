import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey, SystemProgram, TransactionMessage } from '@solana/web3.js';

import AddressBottomSheet from '@/components/AddressBottomSheet';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import ChainSelectBox from '@/components/ChainSelectBox';
import NumberTypo from '@/components/common/NumberTypo';
import StandardInput from '@/components/common/StandardInput';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton';
import { useGetAccountInfo } from '@/hooks/solana/useGetAccountInfo';
import { useGetFeeForMessage } from '@/hooks/solana/useGetFeeForMessage';
import { useGetLatestBlockHash } from '@/hooks/solana/useGetLatestBlockHash';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { isTestnetChain } from '@/utils/chain';
import { times, toBaseDenomAmount } from '@/utils/numbers';
import { getUniqueChainId, parseCoinId } from '@/utils/queryParamGenerator';
import { isDecimal, shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AddressBookButton,
  CoinContainer,
  CoinDenomContainer,
  CoinImage,
  CoinSymbolText,
  DescriptionContainer,
  // Divider,
  EstimatedValueTextContainer,
  InputWrapper,
} from './styled';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type SolanaProps = {
  coinId: string;
};

export default function Solana({ coinId }: SolanaProps) {
  const [inputRecipientAddress, setInputRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const [isOpenAddressBottomSheet, setIsOpenAddressBottomSheet] = useState(false);

  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const [debouncedInputRecipientAddress] = useDebounce(inputRecipientAddress, 500);

  const recipientAddress = useMemo(() => debouncedInputRecipientAddress, [debouncedInputRecipientAddress]);

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { t } = useTranslation();
  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoinToSend = getSolanaAccountAsset();
  const selectedChainId = useMemo(() => {
    const { chainId, chainType } = parseCoinId(coinId);

    return getUniqueChainId({ id: chainId, chainType });
  }, [coinId]);

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

  const displaySendAmountPrice = useMemo(() => (sendDisplayAmount ? times(sendDisplayAmount, coinPrice) : '0'), [coinPrice, sendDisplayAmount]);

  const baseSendAmount = useMemo(() => toBaseDenomAmount(sendDisplayAmount || '0', coinDecimals), [coinDecimals, sendDisplayAmount]);
  const baseAvailableAmount = selectedCoinToSend?.balance || '0';

  const addressInputErrorMessage = useMemo(() => {
    if (recipientAddress) {
      try {
        new PublicKey(recipientAddress);
      } catch {
        return t('pages.wallet.send.$coinId.Entry.Solana.index.invalidAddress');
      }
    }

    return '';
  }, [recipientAddress, t]);

  const sendAmountInputErrorMessage = useMemo(() => {
    return '';
  }, []);

  const handleOnClickMax = useCallback(() => {
    return;
  }, []);

  const { data: latestBlockHash } = useGetLatestBlockHash({ coinId });

  const errorMessage = useMemo(() => {
    if (addressInputErrorMessage) {
      return addressInputErrorMessage;
    }

    if (!recipientAddress) {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.noRecipientAddress');
    }

    if (baseAvailableAmount === '0') {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.noAvailableAmount');
    }

    if (!sendDisplayAmount) {
      return t('pages.wallet.send.$coinId.Entry.Solana.index.noAmount');
    }
  }, [addressInputErrorMessage, baseAvailableAmount, recipientAddress, sendDisplayAmount, t]);

  const toATA = useMemo(() => {
    try {
      if (!errorMessage && selectedCoinToSend?.asset?.type === 'spl-token' && latestBlockHash) {
        const mint = selectedCoinToSend.asset.id;

        const pubMint = new PublicKey(mint);
        const pubRecipient = new PublicKey(recipientAddress);

        return getAssociatedTokenAddressSync(pubMint, pubRecipient);
      }
    } catch {
      return undefined;
    }

    return undefined;
  }, [errorMessage, latestBlockHash, recipientAddress, selectedCoinToSend?.asset.id, selectedCoinToSend?.asset?.type]);

  const { data: toATAInfo } = useGetAccountInfo({
    coinId,
    account: toATA,
  });

  const message = useMemo(() => {
    try {
      if (!errorMessage && selectedCoinToSend && latestBlockHash) {
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

          return messageV0;
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
        return messageV0;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }, [errorMessage, selectedCoinToSend, latestBlockHash, recipientAddress, baseSendAmount, toATAInfo]);

  const { data: feeForMessage } = useGetFeeForMessage({ coinId, message });

  useEffect(() => {
    console.log('selectedCoinToSend', selectedCoinToSend);
    console.log('recipientAddress', recipientAddress);
    console.log('baseSendAmount', baseSendAmount);
    console.log('selectedChainId', selectedChainId);
    console.log('errorMessage', errorMessage);
    console.log('feeForMessage', feeForMessage);
    console.log('toATAInfo', toATAInfo);
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
