import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import { times } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { BodyBottomContainer, BodyContainer, BodyTopContainer, TopContainer } from './styled';
import MainBox from '..';

type CoinOverviewBoxProps = {
  coinId: string;
};

export default function CoinOverviewBox({ coinId }: CoinOverviewBoxProps) {
  const { t } = useTranslation();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { currency } = useExtensionStorageStore((state) => state);

  const { groupAccountAssets } = useGroupAccountAssets();

  const currentGroupCoin = groupAccountAssets?.groupAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const symbol = currentGroupCoin?.asset.symbol;
  const networkCount = currentGroupCoin?.counts || '1';
  const totalDisplayAmount = currentGroupCoin?.totalDisplayAmount || '0';

  const coinPrice = (currentGroupCoin?.asset?.coinGeckoId && coinGeckoPrice?.[currentGroupCoin.asset.coinGeckoId]?.[currency]) || 0;
  const totalValue = times(totalDisplayAmount, coinPrice);

  return (
    <>
      <MainBox
        top={
          <TopContainer>
            <Base1300Text variant="b3_M">{t('components.MainBox.CoinOverview.index.Overview')}</Base1300Text>
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
              <Typography variant="b3_M">
                {`${t('components.MainBox.CoinOverview.index.in')} ${networkCount} ${t('components.MainBox.CoinOverview.index.networks')}`}
              </Typography>
              <NumberTypo typoOfIntegers="h4n_M" typoOfDecimals="h6n_R" currency="usd">
                {totalValue}
              </NumberTypo>
            </BodyBottomContainer>
          </BodyContainer>
        }
        className="circleGradient"
        coinBackgroundImage={currentGroupCoin?.asset.image}
      />
    </>
  );
}
