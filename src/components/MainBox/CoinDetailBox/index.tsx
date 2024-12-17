import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import TextButton from '@/components/common/TextButton';
import { Route as Send } from '@/pages/wallet/send/$coinId';
import { shorterAddress } from '@/utils/string';

import { BodyBottomContainer, BodyContainer, BodyTopContainer, BottomButtonContainer, SpacedTypography, StyledIconTextButton, TopContainer } from './styled';
import MainBox from '..';

import StakeIcon from '@/assets/images/icons/Stake22.svg';

type CoinDetailBoxProps = {
  testCoinId: string;
};

export default function CoinDetailBox({ testCoinId }: CoinDetailBoxProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  console.log('🚀 ~ CoinOverViewBox ~ testCoinId:', testCoinId);
  // TODO
  // const currentCoin = 전체코인리스트.find((coin) => coin.id === testCoinId);

  const symbol = 'USDT';
  const networkCount = 5;
  const totalAmount = '24000';
  const totalValue = '24000';
  const address = 'osmo1aygdt8742gamxv8ca99wzh56ry4xw5s3dtgtpf';

  return (
    <>
      <MainBox
        top={
          <TopContainer>
            <TextButton variant="underline" typoVarient="h6n_M">
              {shorterAddress(address)}
            </TextButton>
          </TopContainer>
        }
        body={
          <BodyContainer>
            <BodyTopContainer>
              <Base1300Text variant="h1_B">{symbol}</Base1300Text>
              <NumberTypo typoOfIntegers="h1n_B" typoOfDecimals="h2n_M">
                {totalAmount}
              </NumberTypo>
            </BodyTopContainer>
            <BodyBottomContainer>
              <Typography variant="b3_M">
                {`${t('components.MainBox.CoinOverview.index.in')} ${networkCount} ${t('components.MainBox.CoinOverview.index.networks')}`}
              </Typography>
              <NumberTypo typoOfIntegers="h4n_M" typoOfDecimals="h6n_R" currency="usd">
                {totalValue}
              </NumberTypo>
            </BodyBottomContainer>
          </BodyContainer>
        }
        bottom={
          <BottomButtonContainer>
            <StyledIconTextButton
              onClick={() => {
                navigate({
                  to: Send.to,
                  params: { coinId: testCoinId },
                });
              }}
              leadingIcon={<StakeIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.CoinOverview.index.send')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.CoinOverview.index.receive')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.CoinOverview.index.swap')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.CoinOverview.index.vote')}</SpacedTypography>
            </StyledIconTextButton>
          </BottomButtonContainer>
        }
        className="circleGradient"
        coinBackgroundImage={'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/sui/asset/sui.png'}
      />
    </>
  );
}
