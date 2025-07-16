import BalanceDisplay from '@/components/BalanceDisplay';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { times } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { LeftContainer, RightContainer, RightDisplayAmountContainer, RightTextContainer, RightValueContainer, StyledButton } from './styled';

export type BaseCoinButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  displayAmount: string;
  coinGeckoId?: string;
  symbol?: string;
  disabled?: boolean;
  leftComponent?: JSX.Element;
  rightComponent?: JSX.Element;
  isActive?: boolean;
  lastUpdatedAtMs?: number | null;
  onClick?: () => void;
};

export default function BaseCoinButton({
  disabled,
  displayAmount,
  coinGeckoId,
  leftComponent,
  rightComponent,
  isActive,
  onClick,
  ...remainder
}: BaseCoinButtonProps) {
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference, isBalanceVisible } = useExtensionStorageStore((state) => state);

  const chainPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const value = times(displayAmount, chainPrice);

  return (
    <StyledButton onClick={onClick} data-is-active={isActive} disabled={disabled} {...remainder}>
      <LeftContainer>{leftComponent}</LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightDisplayAmountContainer>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {displayAmount}
            </BalanceDisplay>
          </RightDisplayAmountContainer>

          <RightValueContainer
            style={{
              visibility: !isBalanceVisible ? 'hidden' : 'visible',
            }}
          >
            <BalanceDisplay typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference}>
              {value}
            </BalanceDisplay>
          </RightValueContainer>
        </RightTextContainer>
        {rightComponent && rightComponent}
      </RightContainer>
    </StyledButton>
  );
}
