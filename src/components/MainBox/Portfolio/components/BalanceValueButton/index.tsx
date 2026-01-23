import Typography from '@mui/material/Typography';

import BalanceDisplay from '@/components/BalanceDisplay';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { usePortfolioValueStore } from '@/zustand/hooks/usePortfolioValueStore';

import { Container, StyledIconButton, ValueButton } from './styled';
import { StyledIconContainer, TotalBalanceContainer } from '../../styled';

import RefreshIcon from '@/assets/images/icons/Refresh18.svg';

interface BalanceValueButtonProps {
  isUpdatingBalance: boolean;
  handleManualBalanceUpdate: () => void;
}

export default function BalanceValueButton({ isUpdatingBalance, handleManualBalanceUpdate }: BalanceValueButtonProps) {
  const { isLoading } = useCoinGeckoPrice();
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);
  const isBalanceVisible = useExtensionStorageStore((state) => state.isBalanceVisible);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  const totalValue = usePortfolioValueStore((state) => state.totalValue);
  const hasAssets = usePortfolioValueStore((state) => state.hasAssets);

  return (
    <Container>
      <ValueButton
        onClick={() => {
          updateExtensionStorageStore('isBalanceVisible', !isBalanceVisible);
        }}
      >
        <TotalBalanceContainer>
          {!hasAssets || isLoading ? (
            <Typography variant="h1n_B">{'--'}</Typography>
          ) : (
            <BalanceDisplay typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" currency={userCurrencyPreference} isDisableLeadingCurreny>
              {totalValue}
            </BalanceDisplay>
          )}
          &nbsp;
          <Typography variant="h2_M">{userCurrencyPreference.toLocaleUpperCase()}</Typography>
        </TotalBalanceContainer>
      </ValueButton>

      <StyledIconButton
        onClick={isUpdatingBalance ? undefined : handleManualBalanceUpdate}
        sx={{
          opacity: isUpdatingBalance ? 0.7 : 1,
          cursor: isUpdatingBalance ? 'not-allowed' : 'pointer',
        }}
      >
        <StyledIconContainer data-is-loading={isUpdatingBalance}>
          <RefreshIcon />
        </StyledIconContainer>
      </StyledIconButton>
    </Container>
  );
}
