import type { FeeCost, GasCost } from '@0xsquid/sdk/dist/types';
import { Typography } from '@mui/material';

import NumberText from '~/Popup/components/common/Number';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { fix, gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';

import { Container, LeftTextContainer, RightTextContainer, TextContainer } from './styled';

type ChainFeeInfoProps = {
  title: string;
  feeInfo: FeeCost[] | GasCost[] | undefined;
  isTilde?: boolean;
};

export default function ChainFeeInfo({ title, feeInfo, isTilde = false }: ChainFeeInfoProps) {
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

          const feeText = `${isTilde ? '~' : ''} ${displayFeeAmount} ${item.token?.symbol}`;
          return (
            <TextContainer key={item.token.address}>
              <Typography variant="h7n">{feeText}</Typography>
              {gt(feeAmountPrice, '0') && (
                <NumberText typoOfIntegers="h7n" typoOfDecimals="h7n" fixed={2} currency={currency}>
                  {feeAmountPrice}
                </NumberText>
              )}
            </TextContainer>
          );
        })}
      </RightTextContainer>
    </Container>
  );
}
