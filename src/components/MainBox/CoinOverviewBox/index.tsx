import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import { BodyBottomContainer, BodyContainer, BodyTopContainer, TopContainer } from './styled';
import MainBox from '..';

type CoinOverviewBoxProps = {
  coinId: string;
};

export default function CoinOverviewBox({ coinId }: CoinOverviewBoxProps) {
  const { t } = useTranslation();

  const { data } = useAccountAssets();
  // TODO
  // const currentCoin = 전체코인리스트.find((coin) => coin.id === testCoinId);

  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const symbol = currentCoin?.asset.symbol;
  const networkCount = 5;
  const totalAmount = '24000';
  const totalValue = '24000';

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
        className="circleGradient"
        coinBackgroundImage={'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/sui/asset/sui.png'}
      />
    </>
  );
}
