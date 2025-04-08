import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import NumberTypo from '@/components/common/NumberTypo';
import MainBox from '@/components/MainBox';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { times } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { BodyBottomContainer, BodyContainer, BodyTopContainer, ChevronIconContainer, MinReceivedAmountTextContainer, SymbolText, TopContainer } from './styled';

import FilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type CoinInputBoxProps = {
  coinId: string;
  displayMinReceiveAmount?: string;
  onChangeCoin: (coinId: string) => void;
};

export default function CoinInputBox({ coinId, displayMinReceiveAmount }: CoinInputBoxProps) {
  const { t } = useTranslation();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { getAccountAsset } = useGetAccountAsset({ coinId });
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const [isOpenCoinBottomSheet, setisOpenCoinBottomSheet] = useState(false);

  const coin = getAccountAsset();

  const { asset, chain } = coin || {};

  const { name: chainName } = chain || {};
  const { image, symbol, coinGeckoId, decimals } = asset || {};

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;
  const totalValue = times(coinPrice, displayMinReceiveAmount || '0');

  if (!asset) return null;

  return (
    <EdgeAligner>
      <MainBox
        top={
          <TopContainer>
            <Base1300Text variant="b3_M">{t('pages.wallet.swap.$coinId.components.CoinOutputBox.index.minReceived')}</Base1300Text>
          </TopContainer>
        }
        body={
          <BodyContainer>
            <BodyTopContainer>
              <IconTextButton
                onClick={() => {
                  setisOpenCoinBottomSheet(!isOpenCoinBottomSheet);
                }}
                trailingIcon={
                  <ChevronIconContainer data-is-open={isOpenCoinBottomSheet}>
                    <FilledChevronIcon />
                  </ChevronIconContainer>
                }
              >
                <SymbolText variant="h1_B">{symbol}</SymbolText>
              </IconTextButton>
              <MinReceivedAmountTextContainer>
                <NumberTypo typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" fixed={decimals}>
                  {totalValue}
                </NumberTypo>
              </MinReceivedAmountTextContainer>
            </BodyTopContainer>
            <BodyBottomContainer>
              <Base1000Text variant="b3_M">{chainName}</Base1000Text>

              <NumberTypo typoOfIntegers="h4n_M" typoOfDecimals="h6n_R" currency={userCurrencyPreference}>
                {totalValue}
              </NumberTypo>
            </BodyBottomContainer>
          </BodyContainer>
        }
        className="circleGradient"
        coinBackgroundImage={image}
      />
    </EdgeAligner>
  );
}
