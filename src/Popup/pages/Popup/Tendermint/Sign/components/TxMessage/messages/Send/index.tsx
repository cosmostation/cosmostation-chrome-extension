import YAML from 'js-yaml';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { TendermintChain } from '~/types/chain';
import type { Msg, Send } from '~/types/tendermint/amino';

import { ContentContainer, FeeInfoContainer, LeftContainer, RightAmountContainer, RightColumnContainer, RightContainer, RightValueContainer } from './styled';
import Container from '../../components/Container';

type SendProps = {
  msg: Msg<Send>;
  chain: TendermintChain;
};

export default function Send({ msg, chain }: SendProps) {
  const { chromeStorage } = useChromeStorage();
  const { data } = useCoinGeckoPriceSWR();
  const { currency } = chromeStorage;
  const { displayDenom, baseDenom, decimals, coinGeckoId } = chain;

  const { value } = msg;

  const { amount } = value;

  const baseDenomAmount = amount.find((item) => item.denom === baseDenom)?.amount || '0';

  const price = (coinGeckoId && data?.[coinGeckoId]?.[currency]) || 0;

  const displayAmount = toDisplayDenomAmount(baseDenomAmount, decimals);

  const displayValue = times(displayAmount, price);
  return (
    <Container title="Send">
      <ContentContainer>
        <FeeInfoContainer>
          <LeftContainer>
            <Typography variant="h5">Fee</Typography>
          </LeftContainer>
          <RightContainer>
            <RightColumnContainer>
              <RightAmountContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {displayAmount}
                </Number>
                &nbsp;
                <Typography variant="h5n">{displayDenom.toUpperCase()}</Typography>
              </RightAmountContainer>
              <RightValueContainer>
                <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={currency}>
                  {displayValue}
                </Number>
              </RightValueContainer>
            </RightColumnContainer>
          </RightContainer>
        </FeeInfoContainer>
      </ContentContainer>
    </Container>
  );
}
