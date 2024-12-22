import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { LeftContainer, RightContainer, RightDisplayAmountContainer, RightTextContainer, RightValueContainer, StyledButton } from './styled';
import NumberTypo from '../NumberTypo';

export type BaseCoinButtonProps = {
  baseAmount: string;
  symbol?: string;
  decimals?: number;
  disabled?: boolean;
  coinGeckoId?: string;
  leftComponent?: JSX.Element;
  rightComponent?: JSX.Element;
  isActive?: boolean;
  onClick?: () => void;
};

export default function BaseCoinButton({
  disabled,
  baseAmount,
  decimals = 0,
  coinGeckoId,
  leftComponent,
  rightComponent,
  isActive,
  onClick,
}: BaseCoinButtonProps) {
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { currency } = useExtensionStorageStore((state) => state);

  const displayAmount = toDisplayDenomAmount(baseAmount, decimals);

  const chainPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

  const value = times(displayAmount, chainPrice);

  return (
    <StyledButton onClick={onClick} data-is-active={isActive} disabled={disabled}>
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
        {rightComponent && rightComponent}
      </RightContainer>
    </StyledButton>
  );
}
