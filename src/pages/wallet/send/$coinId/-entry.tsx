import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import ChainSelectBox from '@/components/ChainSelectBox/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import Fee from '@/components/Fee';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { useChainList } from '@/hooks/useChainList.ts';
import { isDecimal, shorterAddress } from '@/utils/string.ts';

import {
  AddressBookButton,
  CoinContainer,
  CoinDenomContainer,
  CoinImage,
  CoinSymbolText,
  Divider,
  EstimatedValueTextContainer,
  IBCSendText,
  InputWrapper,
} from './-styled.tsx';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  console.log('🚀 ~ Entry ~ coinId:', coinId);

  const { t } = useTranslation();

  const { flatChainList } = useChainList();

  const coinSymbol = 'USDT';
  const coinDenom = 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v';
  const shortCoinDenom = shorterAddress(coinDenom, 16);
  const coinDecimal = 6;
  const estimatedInputAmountValue = '10000';

  const maxAmount = '1000000000000';

  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');
  const [inputMemo, setInputMemo] = useState('');

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const [currentRecipientChainId, setCurrentRecipientChainId] = useState('');
  const currentRecipientChain = flatChainList.find((chain) => chain.id === currentRecipientChainId);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={currentRecipientChain?.image || ''} badgeImageURL={currentRecipientChain?.image || ''} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.send.$coinId.entry.send')}`}</CoinSymbolText>
            <CoinDenomContainer>
              <Typography variant="b4_R">{`${t('pages.wallet.send.$coinId.entry.contract')} :`}</Typography>
              &nbsp;
              <Typography variant="b3_M">{shortCoinDenom}</Typography>
            </CoinDenomContainer>
          </CoinContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={flatChainList}
              currentChainId={currentRecipientChainId}
              onClickChain={(chainId) => {
                setCurrentRecipientChainId(chainId);
              }}
              label={t('pages.wallet.send.$coinId.entry.recipientNetwork')}
              rightAdornmentComponent={<IBCSendText variant="b3_M">{t('pages.wallet.send.$coinId.entry.ibcSend')}</IBCSendText>}
              bottomSheetTitle={t('pages.wallet.send.$coinId.entry.selectRecipientNetwork')}
              bottomSheetSearchPlaceholder={t('pages.wallet.send.$coinId.entry.searchRecipientNetwork')}
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.entry.recipientAddress')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <AddressBookButton>
                        <AddressBookIcon />
                      </AddressBookButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <StandardInput
              label={t('pages.wallet.send.$coinId.entry.amount')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
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
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency="usd" isApporximation>
                          {estimatedInputAmountValue}
                        </NumberTypo>
                      </EstimatedValueTextContainer>
                    </InputAdornment>
                  ),
                },
              }}
              rightBottomAdornment={
                <BalanceButton
                  onClick={() => {
                    setSendDisplayAmount(maxAmount);
                  }}
                />
              }
            />
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.send.$coinId.entry.memo')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
              value={inputMemo}
              // TODO 숫자만 입력할 수 있도록 처리 필요.
              onChange={(e) => setInputMemo(e.target.value)}
            />
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <Fee
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
          />
        </>
      </BaseFooter>
      <ReviewBottomSheet
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.send.$coinId.entry.sendReview')}
        contentsSubTitle={t('pages.wallet.send.$coinId.entry.sendReviewSub')}
        confirmButtonText={t('pages.wallet.send.$coinId.entry.send')}
        onClickCancel={() => {
          console.log('onClickCancel');
        }}
        onClickConfirm={() => {
          console.log('onClickConfirm');
        }}
      />
    </>
  );
}
