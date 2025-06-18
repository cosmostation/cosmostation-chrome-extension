import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1300Text from '@/components/common/Base1300Text';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import { times } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { BodyBottomContainer, BodyContainer, BodyTopContainer, CoingeckoIconContainer, SymbolButton, TopContainer } from './styled';
import MainBox from '..';

import CoinGeckoIcon from '@/assets/images/icons/CoinGecko20.svg';

import DefaultCoinImage from '@/assets/images/coin/defaultCoin.png';

type CoinOverviewBoxProps = {
  coinId: string;
};

export default function CoinOverviewBox({ coinId }: CoinOverviewBoxProps) {
  const [isSymbolButtonHovered, setIsSymbolButtonHovered] = useState(false);

  const { t } = useTranslation();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { groupAccountAssets } = useGroupAccountAssets();

  const currentGroupCoin = groupAccountAssets?.groupAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const symbol = currentGroupCoin?.asset.symbol;
  const networkCount = currentGroupCoin?.counts || '1';
  const totalDisplayAmount = currentGroupCoin?.totalDisplayAmount || '0';

  const coinPrice = (currentGroupCoin?.asset?.coinGeckoId && coinGeckoPrice?.[currentGroupCoin.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;
  const totalValue = times(totalDisplayAmount, coinPrice);
  const coinGeckoUrl = currentGroupCoin?.asset?.coinGeckoId ? `https://www.coingecko.com/en/coins/${currentGroupCoin.asset.coinGeckoId}` : '';

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
              <SymbolButton
                onMouseEnter={() => setIsSymbolButtonHovered(true)}
                onMouseLeave={() => setIsSymbolButtonHovered(false)}
                onClick={() => coinGeckoUrl && window.open(coinGeckoUrl, '_blank')}
                disabled={!coinGeckoUrl}
                trailingIcon={
                  coinGeckoUrl && isSymbolButtonHovered ? (
                    <CoingeckoIconContainer>
                      <CoinGeckoIcon />
                    </CoingeckoIconContainer>
                  ) : undefined
                }
              >
                <Base1300Text
                  variant="h1_B"
                  style={{
                    marginRight: '0.2rem',
                  }}
                >
                  {symbol}
                </Base1300Text>
              </SymbolButton>
              <BalanceDisplay typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" fixed={6}>
                {totalDisplayAmount}
              </BalanceDisplay>
            </BodyTopContainer>
            <BodyBottomContainer>
              <Typography variant="b3_M">
                {`${t('components.MainBox.CoinOverview.index.in')} ${networkCount} ${t('components.MainBox.CoinOverview.index.networks')}`}
              </Typography>
              <BalanceDisplay typoOfIntegers="h4n_M" typoOfDecimals="h6n_R" currency={userCurrencyPreference}>
                {totalValue}
              </BalanceDisplay>
            </BodyBottomContainer>
          </BodyContainer>
        }
        className="circleGradient"
        bgImageClassName="coinOverView"
        coinBackgroundImage={currentGroupCoin?.asset.image || DefaultCoinImage}
      />
    </>
  );
}
