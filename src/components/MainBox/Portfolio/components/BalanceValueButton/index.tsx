import Typography from '@mui/material/Typography';

import BalanceDisplay from '@/components/BalanceDisplay';
import IconTextButton from '@/components/common/IconTextButton';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { PortfolioCoinItem } from '@/pages/-entry';
import { plus } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { StyledIconContainer, TotalBalanceContainer } from '../../styled';

import RefreshIcon from '@/assets/images/icons/Refresh18.svg';

interface BalanceValueButtonProps {
  accountAssets: PortfolioCoinItem[];
  isUpdatingBalance: boolean;
  isHovering: boolean;
  handleManualBalanceUpdate: () => void;
  handleHovering: (value: boolean) => void;
}

export default function BalanceValueButton({
  accountAssets,
  isUpdatingBalance,
  isHovering,
  handleManualBalanceUpdate,
  handleHovering,
}: BalanceValueButtonProps) {
  const { isLoading } = useCoinGeckoPrice();
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);

  const aggregateValue = accountAssets.reduce((acc, cur) => {
    const sum = plus(acc, cur.value);

    return sum;
  }, '0');

  return (
    <IconTextButton
      onClick={handleManualBalanceUpdate}
      onMouseEnter={() => {
        handleHovering(true);
      }}
      onMouseLeave={() => {
        handleHovering(false);
      }}
      isHovering={isHovering}
      disabled={isUpdatingBalance}
      trailingIcon={
        <StyledIconContainer data-is-loading={isUpdatingBalance}>
          <RefreshIcon />
        </StyledIconContainer>
      }
      style={{
        cursor: isUpdatingBalance ? 'not-allowed' : 'default',
      }}
    >
      <TotalBalanceContainer>
        {!accountAssets || accountAssets.length === 0 || isLoading ? (
          <Typography variant="h1n_B">{'--'}</Typography>
        ) : (
          <BalanceDisplay typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" currency={userCurrencyPreference} isDisableLeadingCurreny>
            {aggregateValue}
          </BalanceDisplay>
        )}
        &nbsp;
        <Typography variant="h2_M">{userCurrencyPreference.toLocaleUpperCase()}</Typography>
      </TotalBalanceContainer>
    </IconTextButton>
  );
}
