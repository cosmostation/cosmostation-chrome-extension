import type { TokenData } from '@0xsquid/sdk';
import { Typography } from '@mui/material';

import NumberText from '~/Popup/components/common/Number';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { fix, gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';

import { Container, LeftTextContainer, RightTextContainer, TextContainer } from './styled';

type FeeInfo = {
  amount: string;
  feeToken?: TokenData;
};

type ChainFeeInfoProps = {
  title: string;
  feeInfo?: FeeInfo[];
  isTildeAmount?: boolean;
};

export default function ChainFeeInfo({ title, feeInfo, isTildeAmount = false }: ChainFeeInfoProps) {
  const { extensionStorage } = useExtensionStorage();
  const { currency } = extensionStorage;
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  return (
    <Container>
      <LeftTextContainer>
        <Typography variant="h7n">{title}</Typography>
      </LeftTextContainer>
      <RightTextContainer>
        {feeInfo?.length ? (
          feeInfo?.map((item) => {
            const displayFeeAmount = String(parseFloat(fix(toDisplayDenomAmount(item.amount || '0', item.feeToken?.decimals || 0), 5)));

            const feeTokenPrice = (item.feeToken?.coingeckoId && coinGeckoPrice.data?.[item.feeToken?.coingeckoId]?.[extensionStorage.currency]) || 0;
            const feeAmountPrice = times(displayFeeAmount, feeTokenPrice);

            const feeText = `${isTildeAmount ? '~' : ''} ${!gt(displayFeeAmount, '0') ? '<' : ''} ${displayFeeAmount} ${item.feeToken?.symbol || ''}`;
            return (
              <TextContainer key={item.feeToken?.address}>
                <Typography variant="h7n">{feeText}</Typography>
                &nbsp;
                {gt(feeAmountPrice, '0') && (
                  <>
                    <Typography variant="h7n">(</Typography>
                    <NumberText typoOfIntegers="h7n" typoOfDecimals="h7n" fixed={2} currency={currency}>
                      {feeAmountPrice}
                    </NumberText>
                    <Typography variant="h7n">)</Typography>
                  </>
                )}
              </TextContainer>
            );
          })
        ) : (
          <Typography variant="h7">-</Typography>
        )}
      </RightTextContainer>
    </Container>
  );
}
