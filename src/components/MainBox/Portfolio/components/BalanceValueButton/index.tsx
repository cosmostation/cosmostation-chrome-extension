import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';

import BalanceDisplay from '@/components/BalanceDisplay';
import IconTextButton from '@/components/common/IconTextButton';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { UniqueChainId } from '@/types/chain';
import { getFilteredAssetsByChainId, isStakeableAsset } from '@/utils/asset';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { StyledIconContainer, TotalBalanceContainer } from '../../styled';

import RefreshIcon from '@/assets/images/icons/Refresh18.svg';

interface BalanceValueButtonProps {
  accountAssets: FlatAccountAssets[];
  isUpdatingBalance: boolean;
  isHovering: boolean;
  selectedChainId?: UniqueChainId;
  handleManualBalanceUpdate: () => void;
  handleHovering: (value: boolean) => void;
}

export default function BalanceValueButton({
  accountAssets,
  isUpdatingBalance,
  selectedChainId,
  isHovering,
  handleManualBalanceUpdate,
  handleHovering,
}: BalanceValueButtonProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [aggregatedTotalValue, setAggregatedTotalValue] = useState('0');

  const { data: coinGeckoPrice, isLoading } = useCoinGeckoPrice();
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);

  useEffect(() => {
    setIsProcessing(true);

    if (!accountAssets || accountAssets.length === 0) {
      return;
    }

    const filteredAssetsByChainId = getFilteredAssetsByChainId(accountAssets, selectedChainId);

    const aggregateValue = filteredAssetsByChainId.reduce((acc, item) => {
      const balance = isStakeableAsset(item) ? item.totalBalance || '0' : item.balance;

      const displayAmount = toDisplayDenomAmount(balance, item.asset.decimals || 0);
      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

      const value = times(displayAmount, coinPrice);

      return plus(acc, value);
    }, '0');

    setAggregatedTotalValue(aggregateValue);
    if (!isLoading) {
      setIsProcessing(false);
    }
  }, [accountAssets, coinGeckoPrice, isLoading, selectedChainId, userCurrencyPreference]);

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
      trailingIcon={
        isHovering || isUpdatingBalance ? (
          <StyledIconContainer data-is-loading={isUpdatingBalance}>
            <RefreshIcon />
          </StyledIconContainer>
        ) : undefined
      }
    >
      <TotalBalanceContainer>
        {isProcessing ? (
          <Typography variant="h1n_B">{'--'}</Typography>
        ) : (
          <BalanceDisplay typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" currency={userCurrencyPreference} isDisableLeadingCurreny>
            {aggregatedTotalValue}
          </BalanceDisplay>
        )}
        &nbsp;
        <Typography variant="h2_M">{userCurrencyPreference.toLocaleUpperCase()}</Typography>
      </TotalBalanceContainer>
    </IconTextButton>
  );
}
