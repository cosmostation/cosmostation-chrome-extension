import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { isMatchingCoinId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
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
  chainId: string;
  feeBaseAmount: string;
  feeCoinId: string;
  onClickFee?: () => void;
};

export default function BaseTxInfo({ chainId, feeBaseAmount, feeCoinId, onClickFee }: BaseTxInfoProps) {
  const { t } = useTranslation();
  const { flatChainList } = useChainList();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { data: accountAssets } = useAccountAssets();

  const chain = flatChainList.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const feeCoin = accountAssets?.flatAccountAssets.find((asset) => isMatchingCoinId(asset.asset, feeCoinId));

  const coinPrice = (feeCoin?.asset.coinGeckoId && coinGeckoPrice?.[feeCoin.asset.coinGeckoId]?.[currency]) || 0;

  const displayFeeAmount = feeBaseAmount ? toDisplayDenomAmount(feeBaseAmount, feeCoin?.asset.decimals || 0) : '0';

  const value = times(displayFeeAmount, coinPrice);
  return (
    <Container>
      <RowContainer>
        <RowLeftContainer>
          <Base1000Text variant="b3_R">{t('pages.popup.components.BaseTxInfo.index.network')}</Base1000Text>
        </RowLeftContainer>
        <RowRightContainer>
          <ChainContainer>
            <ChainImageContainer src={chain?.image} />
            <Base1300Text variant="b3_M">{chain?.name}</Base1300Text>
          </ChainContainer>
        </RowRightContainer>
      </RowContainer>

      <RowContainer>
        <RowLeftContainer>
          <Base1000Text variant="b3_R">{t('pages.popup.components.BaseTxInfo.index.networkFee')}</Base1000Text>
        </RowLeftContainer>
        <RowRightContainer>
          <FeeCustomButton onClick={onClickFee}>
            {displayFeeAmount ? (
              <EstimatedFeeTextContainer>
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
