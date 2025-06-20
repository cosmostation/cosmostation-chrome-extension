import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import BalanceDisplay from '@/components/BalanceDisplay';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import TextButton from '@/components/common/TextButton';
import CopyButton from '@/components/CopyButton';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { isEqualsIgnoringCase } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  ChangeRateContainer,
  ChevronIconContainer,
  CoinContainer,
  CoinDenomContainer,
  CoingeckoContainer,
  CoingeckoIconContainer,
  CoinImage,
  CoinSymbolText,
  DetailInfoContainer,
  EllipsisContainer,
  FullContractAddressText,
  LabelContainer,
  RowContainer,
  SectionContainer,
  SectionWrapper,
  TitleText,
  ValueContainer,
} from './-styled';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import CoinGeckoIcon from '@/assets/images/icons/CoinGecko20.svg';
import TopFilledChevronIcon from '@/assets/images/icons/TopFilledChevron8.svg';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { getAccountAsset } = useGetAccountAsset({ coinId });
  const { data: currentAccountAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });
  const { userCurrencyPreference, userPriceTrendPreference } = useExtensionStorageStore((state) => state);

  const currentAsset = getAccountAsset();

  const { id: coinDenom, symbol, image: coinImageURL, coinGeckoId, type: coinType, description, decimals } = currentAsset?.asset || {};
  const { image: coinBadgeImageURL, chainType, name: chainName } = currentAsset?.chain || {};

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const cap = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[`${userCurrencyPreference}_24h_change`]) || 0;

  const trend = cap > 0 ? 'upward' : cap < 0 ? 'downward' : 'unchanged';

  const coinTypeLabel = (() => {
    if (coinType === 'cw20' || coinType === 'erc20') return t('pages.coin-detail.$coinId.about.entry.contract');
    if (chainType === 'cosmos') return t('pages.coin-detail.$coinId.about.entry.denom');
    return t('pages.coin-detail.$coinId.about.entry.coinId');
  })();

  const coinTypeInfo = (() => {
    if (coinType === 'erc20') return t('pages.coin-detail.$coinId.about.entry.erc20Coin');
    if (coinType === 'cw20') return t('pages.coin-detail.$coinId.about.entry.cw20Coin');
    if (coinType === 'native') return t('pages.coin-detail.$coinId.about.entry.nativeCoin');
    if (coinType === 'bridge') return t('pages.coin-detail.$coinId.about.entry.bridgeCoin');

    return coinType?.toUpperCase() || undefined;
  })();

  const isEthermint = currentAsset?.chain.chainType === 'evm' && currentAsset?.chain.isCosmos;

  const isMainCoin = isEqualsIgnoringCase(coinDenom, NATIVE_EVM_COIN_ADDRESS);

  const isShowCosmosStyle = isEthermint && isMainCoin;

  const cosmosStyleCoin = isShowCosmosStyle
    ? currentAccountAssets?.cosmosAccountAssets.find(
        (item) =>
          item.asset.id === currentAsset.chain.mainAssetDenom &&
          item.chain.id === currentAsset.chain.id &&
          item.address.chainId === currentAsset.address.chainId &&
          item.address.accountType.hdPath === currentAsset.address.accountType.hdPath,
      )
    : undefined;

  const resolvedCoinDenom = cosmosStyleCoin ? cosmosStyleCoin.asset.id : coinDenom;

  const coinGeckoUrl = coinGeckoId ? ` https://www.coingecko.com/en/coins/${coinGeckoId}` : '';

  return (
    <BaseBody>
      <EdgeAligner>
        <CoinContainer>
          <CoinImage imageURL={coinImageURL} badgeImageURL={coinBadgeImageURL || ''} />
          <CoinSymbolText variant="h2_B">{symbol}</CoinSymbolText>
          <CoinDenomContainer>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} isDisableHidden>
              {String(coinPrice)}
            </BalanceDisplay>
            &nbsp;
            <ChangeRateContainer trend={trend} data-price-trend-color={userPriceTrendPreference}>
              <ChevronIconContainer trend={trend} data-price-trend-color={userPriceTrendPreference}>
                {trend === 'downward' ? <BottomFilledChevronIcon /> : <TopFilledChevronIcon />}
              </ChevronIconContainer>
              <ValueContainer>
                <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={2}>
                  {String(Math.abs(cap))}
                </NumberTypo>
                &nbsp;
                <Typography variant="h8n_R">%</Typography>
              </ValueContainer>
            </ChangeRateContainer>
          </CoinDenomContainer>
        </CoinContainer>

        <SectionWrapper>
          <SectionContainer>
            <LabelContainer>
              <CopyButton
                varient="dark"
                iconSize={{
                  width: 1.6,
                  height: 1.6,
                }}
                copyString={resolvedCoinDenom}
                leading={<TitleText variant="h3_B">{coinTypeLabel}</TitleText>}
              />
              <EllipsisContainer>
                <FullContractAddressText variant="b3_M_Multiline">{resolvedCoinDenom}</FullContractAddressText>
              </EllipsisContainer>
            </LabelContainer>
          </SectionContainer>

          {description && (
            <SectionContainer>
              <LabelContainer>
                <TitleText variant="h3_B">{t('pages.coin-detail.$coinId.about.entry.description')}</TitleText>
                <EllipsisContainer>
                  <Base1000Text variant="b3_M_Multiline">{description}</Base1000Text>
                </EllipsisContainer>
              </LabelContainer>
            </SectionContainer>
          )}

          <SectionContainer>
            <LabelContainer>
              <TitleText variant="h3_B">{t('pages.coin-detail.$coinId.about.entry.detailInformation')}</TitleText>
              <DetailInfoContainer>
                <RowContainer>
                  <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.about.entry.network')}</Base1000Text>
                  <Base1300Text variant="b3_M">{chainName}</Base1300Text>
                </RowContainer>
                {coinTypeInfo && (
                  <RowContainer>
                    <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.about.entry.type')}</Base1000Text>
                    <Base1300Text variant="b3_M">{coinTypeInfo}</Base1300Text>
                  </RowContainer>
                )}
                <RowContainer>
                  <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.about.entry.decimals')}</Base1000Text>
                  <Base1300Text variant="b3_M">
                    {t('pages.coin-detail.$coinId.about.entry.displayDecimals', {
                      decimals: decimals,
                    })}
                  </Base1300Text>
                </RowContainer>
              </DetailInfoContainer>
            </LabelContainer>
          </SectionContainer>

          {coinGeckoId && (
            <SectionContainer>
              <LabelContainer>
                <TitleText variant="h3_B">{t('pages.coin-detail.$coinId.about.entry.learnMore')}</TitleText>
                <CoingeckoContainer>
                  <CoingeckoIconContainer>
                    <CoinGeckoIcon />
                  </CoingeckoIconContainer>
                  <TextButton onClick={() => coinGeckoUrl && window.open(coinGeckoUrl, '_blank')} variant="blueHyperlink" typoVarient="b3_M">
                    {t('pages.coin-detail.$coinId.about.entry.coinGecko')}
                  </TextButton>
                </CoingeckoContainer>
              </LabelContainer>
            </SectionContainer>
          )}
        </SectionWrapper>
      </EdgeAligner>
    </BaseBody>
  );
}
