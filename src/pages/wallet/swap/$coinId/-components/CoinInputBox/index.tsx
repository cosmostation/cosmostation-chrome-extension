import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import NumberTypo from '@/components/common/NumberTypo';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton';
import MainBox from '@/components/MainBox';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { isDecimal, times } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { BodyBottomContainer, BodyContainer, BodyTopContainer, ChevronIconContainer, RightAlignedInput, SymbolText, TopContainer } from './styled';

import FilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type CoinInputBoxProps = {
  coinId: string;
  displayInputAmount?: string;
  onChangeInputAmount: (amount: string) => void;
  onChangeCoin: (coinId: string) => void;
};

export default function CoinInputBox({ coinId, displayInputAmount, onChangeInputAmount }: CoinInputBoxProps) {
  const { t } = useTranslation();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { getAccountAsset } = useGetAccountAsset({ coinId });
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const [isOpenCoinBottomSheet, setisOpenCoinBottomSheet] = useState(false);

  const coin = getAccountAsset();

  const { asset, balance, chain } = coin || {};

  const { name: chainName } = chain || {};
  const { image, symbol, coinGeckoId, decimals } = asset || {};

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;
  const totalValue = times(coinPrice, displayInputAmount || '0');

  if (!asset) return null;

  return (
    <EdgeAligner>
      <MainBox
        top={
          <TopContainer>
            <Base1300Text variant="b3_M">{t('pages.wallet.swap.$coinId.components.CoinInputBox.index.payAmount')}</Base1300Text>

            <BalanceButton coin={asset} balance={balance || ''} />
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
              <RightAlignedInput
                placeholder="0"
                value={displayInputAmount}
                onChange={(e) => {
                  if (!isDecimal(e.currentTarget.value, decimals || 0) && e.currentTarget.value) {
                    return;
                  }

                  onChangeInputAmount(e.currentTarget.value);
                }}
              />
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
