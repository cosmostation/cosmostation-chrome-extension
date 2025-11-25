import { useState } from 'react';
import Typography from '@mui/material/Typography';

import BalanceDisplay from '@/components/BalanceDisplay';
import { useManualBalanceUpdate } from '@/hooks/common/useManualBalanceUpdate';
import { useAutoBalanceRefresh } from '@/hooks/update/useAutoBalanceRefresh';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { FlatAccountAssets } from '@/types/accountAssets';
import { isStakeableAsset } from '@/utils/asset';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container, StyledIconButton, ValueButton } from './styled';
import { BodyBottomContainer, BodyContainer, BodyTopContainer, StyledIconContainer, TotalValueButton } from '../../styled';
import SymbolButton from '../SymbolButton';

import RefreshIcon from '@/assets/images/icons/Refresh18.svg';

interface ValueButtonWrapperProps {
  currentCoin?: FlatAccountAssets;
}

export default function ValueButtonWrapper({ currentCoin }: ValueButtonWrapperProps) {
  const [isBalanceVisibleButtonHovered, setIsBalanceVisibleButtonHovered] = useState(false);

  const { updateChainBalance, isLoadingChainBalance } = useManualBalanceUpdate();

  const { isLoading: isUpdateChainBalanceLoading } = useAutoBalanceRefresh(currentCoin?.chain && [getUniqueChainId(currentCoin.chain)]);

  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);
  const isBalanceVisible = useExtensionStorageStore((state) => state.isBalanceVisible);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const coinGeckoId = currentCoin?.asset.coinGeckoId;
  const chainName = currentCoin?.chain.name;
  const balance = currentCoin && isStakeableAsset(currentCoin) ? currentCoin.totalBalance || '0' : currentCoin?.balance || '0';

  const totalDisplayAmount = toDisplayDenomAmount(balance, currentCoin?.asset.decimals || 0);

  const chainPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;
  const totalValue = times(totalDisplayAmount, chainPrice);

  const isUpdatingBalance = isLoadingChainBalance || isUpdateChainBalanceLoading;

  const handleMouseEnterOnValue = () => setIsBalanceVisibleButtonHovered(true);
  const handleMouseLeaveOnValue = () => setIsBalanceVisibleButtonHovered(false);

  const handleManualBalanceUpdate = async () => {
    if (!currentCoin?.chain) return;

    const chainId = getUniqueChainId(currentCoin.chain);

    await updateChainBalance(chainId);
  };

  const handleUpdateBalanceVisible = () => {
    updateExtensionStorageStore('isBalanceVisible', !isBalanceVisible);
  };

  return (
    <BodyContainer>
      <BodyTopContainer>
        <SymbolButton currentCoin={currentCoin} />

        <Container>
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

          <ValueButton
            onClick={handleUpdateBalanceVisible}
            onMouseEnter={handleMouseEnterOnValue}
            onMouseLeave={handleMouseLeaveOnValue}
            data-is-hovering={isBalanceVisibleButtonHovered}
          >
            <BalanceDisplay typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" fixed={6}>
              {totalDisplayAmount}
            </BalanceDisplay>
          </ValueButton>
        </Container>
      </BodyTopContainer>
      <BodyBottomContainer>
        <Typography variant="b3_M">{chainName}</Typography>
        <TotalValueButton
          onMouseEnter={handleMouseEnterOnValue}
          onMouseLeave={handleMouseLeaveOnValue}
          disabled={isUpdatingBalance}
          data-is-hovering={isBalanceVisibleButtonHovered}
          onClick={handleUpdateBalanceVisible}
        >
          <BalanceDisplay typoOfIntegers="h4n_M" typoOfDecimals="h6n_R" currency={userCurrencyPreference}>
            {totalValue}
          </BalanceDisplay>
        </TotalValueButton>
      </BodyBottomContainer>
    </BodyContainer>
  );
}
