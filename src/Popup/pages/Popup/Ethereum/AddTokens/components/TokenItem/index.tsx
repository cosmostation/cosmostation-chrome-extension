import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokenBalanceSWR';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import type { EthcAddTokensParam } from '~/types/message/ethereum';

import {
  LeftContainer,
  LeftImageContainer,
  LeftTextChainContainer,
  LeftTextContainer,
  RightContainer,
  RightTextContainer,
  RightTextDisplayAmountContainer,
  StyledButton,
} from './styled';

type TokenItemProps = {
  token: EthcAddTokensParam;
  onClick?: () => void;
  disabled?: boolean;
};

export default function TokenItem({ token, disabled, onClick }: TokenItemProps) {
  const tokenBalance = useTokenBalanceSWR({ token });

  const amount = tokenBalance.data || '0';
  const displayAmount = toDisplayDenomAmount(amount, token.decimals);

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={token.imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{token.displayDenom}</Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextDisplayAmountContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
              {displayAmount}
            </Number>
          </RightTextDisplayAmountContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}
