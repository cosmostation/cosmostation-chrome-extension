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
import { useChainList } from '@/hooks/useChainList.ts';
import { isDecimal } from '@/utils/string.ts';

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
  //   const navigate = useNavigate();

  const { flatChainList } = useChainList();

  const coinSymbol = 'USDT';
  const coinDenom = 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v';
  const coinDecimal = 6;
  const estimatedInputAmountValue = '10000';

  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendDisplayAmount, setSendDisplayAmount] = useState('');
  const [inputMemo, setInputMemo] = useState('');

  const [currentRecipientChainId, setCurrentRecipientChainId] = useState('');
  const currentRecipientChain = flatChainList.find((chain) => chain.id === currentRecipientChainId);

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={currentRecipientChain?.image || ''} badgeImageURL={currentRecipientChain?.image || ''} />
            <CoinSymbolText>{`${coinSymbol} ${t('pages.wallet.send.send')}`}</CoinSymbolText>
            <CoinDenomContainer>
              <Typography>{'Contract:'}</Typography>
              &nbsp;
              <Typography variant="b3_M">{coinDenom}</Typography>
            </CoinDenomContainer>
          </CoinContainer>

          <InputWrapper>
            <ChainSelectBox
              chainList={flatChainList}
              currentChainId={currentRecipientChainId}
              onClickChain={(chainId) => {
                setCurrentRecipientChainId(chainId);
              }}
              label={t('pages.wallet.send.recipientNetwork')}
              rightAdornmentComponent={<IBCSendText variant="b3_M">{t('pages.wallet.send.ibcSend')}</IBCSendText>}
              bottomSheetTitle={t('pages.wallet.send.selectRecipientNetwork')}
              bottomSheetSearchPlaceholder={t('pages.wallet.send.searchRecipientNetwork')}
            />
            <StandardInput
              label={t('pages.wallet.send.recipientAddress')}
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
              label={t('pages.wallet.send.amount')}
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
              rightBottomAdornment={<BalanceButton />}
            />
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.send.memo')}
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
          <Fee />
        </>
      </BaseFooter>
    </>
  );
}
