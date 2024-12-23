import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import TextButton from '@/components/common/TextButton';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { Route as Send } from '@/pages/wallet/send/$coinId';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { BodyBottomContainer, BodyContainer, BodyTopContainer, BottomButtonContainer, SpacedTypography, StyledIconTextButton, TopContainer } from './styled';
import MainBox from '..';

import StakeIcon from '@/assets/images/icons/Stake22.svg';

type CoinDetailBoxProps = {
  coinId: string;
};

export default function CoinDetailBox({ coinId }: CoinDetailBoxProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { data } = useAccountAssets();

  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const coinImage = currentCoin?.asset.image;
  const symbol = currentCoin?.asset.symbol;
  const chainName = currentCoin?.chain.name;
  const coinGeckoId = currentCoin?.asset.coinGeckoId;

  const totalDisplayAmount = toDisplayDenomAmount(currentCoin?.balance || '0', currentCoin?.asset.decimals || 0);
  const chainPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

  const totalValue = times(totalDisplayAmount, chainPrice);
  const address = currentCoin?.address.address || '';

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
                {totalDisplayAmount}
              </NumberTypo>
            </BodyTopContainer>
            <BodyBottomContainer>
              <Typography variant="b3_M">{chainName}</Typography>
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
                  params: { coinId: coinId },
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
        coinBackgroundImage={coinImage}
      />
    </>
  );
}
