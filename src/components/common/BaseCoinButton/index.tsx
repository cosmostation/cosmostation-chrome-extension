import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { times } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { LeftContainer, RightContainer, RightDisplayAmountContainer, RightTextContainer, RightValueContainer, StyledButton } from './styled';
import NumberTypo from '../NumberTypo';

export type BaseCoinButtonProps = {
  displayAmount: string;
  coinGeckoId?: string;
  symbol?: string;
  disabled?: boolean;
  leftComponent?: JSX.Element;
  rightComponent?: JSX.Element;
  isActive?: boolean;
  onClick?: () => void;
};

export default function BaseCoinButton({ disabled, displayAmount, coinGeckoId, leftComponent, rightComponent, isActive, onClick }: BaseCoinButtonProps) {
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const chainPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const value = times(displayAmount, chainPrice);

  return (
    <StyledButton onClick={onClick} data-is-active={isActive} disabled={disabled}>
      <LeftContainer>{leftComponent}</LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightDisplayAmountContainer>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {displayAmount}
            </NumberTypo>
          </RightDisplayAmountContainer>

          <RightValueContainer>
            <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference}>
              {value}
            </NumberTypo>
          </RightValueContainer>
        </RightTextContainer>
        {rightComponent && rightComponent}
      </RightContainer>
    </StyledButton>
  );
}
