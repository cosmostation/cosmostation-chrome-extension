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

import { AddressBookButton, CoinContainer, CoinDenomContainer, CoinImage, CoinSymbolText, Divider, EstimatedValueTextContainer } from './-styled.tsx';

import AddressBookIcon from '@/assets/images/icons/AddressBook20.svg';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  console.log('🚀 ~ Entry ~ coinId:', coinId);

  const { t } = useTranslation();
  //   const navigate = useNavigate();

  const coinSymbol = 'USDT';
  const coinDenom = 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v';
  const estimatedInputAmountValue = '10000';

  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendBaseAmount, setSendBsaeAmount] = useState('');
  const [inputMemo, setInputMemo] = useState('');

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage
              imageURL="https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/sui/asset/sui.png"
              badgeImageURL="https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/sui/asset/sui.png"
            />
            <CoinSymbolText>{`${coinSymbol} ${t('pages.wallet.send.send')}`}</CoinSymbolText>
            <CoinDenomContainer>
              <Typography>{'Contract:'}</Typography>
              &nbsp;
              <Typography variant="b3_M">{coinDenom}</Typography>
            </CoinDenomContainer>
          </CoinContainer>

          <ChainSelectBox label="Recipient Network" />
          <StandardInput
            label={t('pages.account.set-password.index.password')}
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
            label={t('pages.account.set-password.index.password')}
            // error={!!errors.password}
            // helperText={errors.password?.message}
            value={sendBaseAmount}
            // TODO 숫자만 입력할 수 있도록 처리 필요.
            onChange={(e) => setSendBsaeAmount(e.target.value)}
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
            label={t('pages.account.set-password.index.password')}
            // error={!!errors.password}
            // helperText={errors.password?.message}
            value={inputMemo}
            // TODO 숫자만 입력할 수 있도록 처리 필요.
            onChange={(e) => setInputMemo(e.target.value)}
          />
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
