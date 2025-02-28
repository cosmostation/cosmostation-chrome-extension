import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  ChainContainer,
  ChainImageContainer,
  Container,
  EstimatedFeeTextContainer,
  FeeCustomButton,
  RowContainer,
  RowLeftContainer,
  RowRightContainer,
} from './styled';

type BaseTxInfoProps = {
  feeBaseAmount: string;
  feeCoinId: string;
  disableFee?: boolean;
  onClickFee?: () => void;
};

export default function BaseTxInfo({ feeBaseAmount, feeCoinId, disableFee = false, onClickFee }: BaseTxInfoProps) {
  const { t } = useTranslation();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId: feeCoinId });

  const feeCoin = getCosmosAccountAsset();

  const coinPrice = (feeCoin?.asset.coinGeckoId && coinGeckoPrice?.[feeCoin.asset.coinGeckoId]?.[currency]) || 0;

  const displayFeeAmount = useMemo(
    () => (feeBaseAmount ? toDisplayDenomAmount(feeBaseAmount, feeCoin?.asset.decimals || 0) : '0'),
    [feeBaseAmount, feeCoin?.asset.decimals],
  );

  const value = times(displayFeeAmount, coinPrice);
  return (
    <Container>
      <RowContainer>
        <RowLeftContainer>
          <Base1000Text variant="b3_R">{t('pages.popup.components.BaseTxInfo.index.network')}</Base1000Text>
        </RowLeftContainer>
        <RowRightContainer>
          <ChainContainer>
            <ChainImageContainer src={feeCoin?.chain.image} />
            <Base1300Text variant="b3_M">{feeCoin?.chain.name || 'UNKNOWN'}</Base1300Text>
          </ChainContainer>
        </RowRightContainer>
      </RowContainer>

      <RowContainer>
        <RowLeftContainer>
          <Base1000Text variant="b3_R">{t('pages.popup.components.BaseTxInfo.index.networkFee')}</Base1000Text>
        </RowLeftContainer>
        <RowRightContainer>
          <FeeCustomButton disabled={disableFee} onClick={onClickFee}>
            {displayFeeAmount ? (
              <EstimatedFeeTextContainer data-is-disabled={disableFee}>
                <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={currency} fixed={feeCoin?.asset.decimals} isDisableLeadingCurreny>
                  {displayFeeAmount}
                </NumberTypo>
                &nbsp;
                <Base1300Text variant="h7n_M">{feeCoin?.asset.symbol}</Base1300Text>
                &nbsp;
                <Base1300Text variant="b2_M">{'('}</Base1300Text>
                <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency="usd">
                  {value}
                </NumberTypo>
                <Base1300Text variant="b2_M">{')'}</Base1300Text>
              </EstimatedFeeTextContainer>
            ) : (
              <Base1300Text variant="b2_M">{')'}</Base1300Text>
            )}
          </FeeCustomButton>
        </RowRightContainer>
      </RowContainer>
    </Container>
  );
}
