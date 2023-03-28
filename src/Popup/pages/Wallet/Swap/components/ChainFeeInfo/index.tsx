import type { FeeCost, GasCost } from '@0xsquid/sdk/dist/types';
import { Typography } from '@mui/material';

import NumberText from '~/Popup/components/common/Number';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { fix, times, toDisplayDenomAmount } from '~/Popup/utils/big';

import { Container, LeftTextContainer, RightTextContainer, TextContainer } from './styled';

type ChainFeeInfoProps = {
  title: string;
  feeInfo: FeeCost[] | GasCost[] | undefined;
};

export default function ChainFeeInfo({ title, feeInfo }: ChainFeeInfoProps) {
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  return (
    <Container>
      <LeftTextContainer>
        <Typography variant="h7n">{title}</Typography>
      </LeftTextContainer>
      <RightTextContainer>
        {feeInfo?.map((item) => {
          const displayFeeAmount = String(parseFloat(fix(toDisplayDenomAmount(item.amount || '0', item.token?.decimals), 5)));

          const feeTokenPrice = (item.token?.coingeckoId && coinGeckoPrice.data?.[item.token.coingeckoId]?.[chromeStorage.currency]) || 0;
          const feeAmountPrice = times(displayFeeAmount, feeTokenPrice);

          return (
            <TextContainer key={item.token.address}>
              <NumberText typoOfIntegers="h7n" typoOfDecimals="h7n">
                {displayFeeAmount}
              </NumberText>
              &nbsp;
              <Typography variant="h7n">{item.token?.symbol}</Typography>
              &nbsp; (
              <NumberText typoOfIntegers="h7n" typoOfDecimals="h7n" fixed={2} currency={currency}>
                {feeAmountPrice}
              </NumberText>
              )
            </TextContainer>
          );
        })}
      </RightTextContainer>
    </Container>
  );
}
