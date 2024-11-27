import { LeftContainer, RightContainer, RightDisplayAmountContainer, RightTextContainer, RightValueContainer, StyledButton } from './styled';
import NumberTypo from '../NumberTypo';

export type BaseCoinButtonProps = {
  baseAmount: string;
  symbol?: string;
  decimals?: number;
  disabled?: boolean;
  coinGeckoId?: string;
  leftComponent?: JSX.Element;
  onClick?: () => void;
};

export default function BaseCoinButton({ disabled, baseAmount, decimals = 0, leftComponent, onClick }: BaseCoinButtonProps) {
  const displayAmount = String(Number(baseAmount) * decimals);

  const value = '60000';

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <LeftContainer>{leftComponent}</LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightDisplayAmountContainer>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R">
              {displayAmount}
            </NumberTypo>
          </RightDisplayAmountContainer>

          <RightValueContainer>
            <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency="usd">
              {value}
            </NumberTypo>
          </RightValueContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}
