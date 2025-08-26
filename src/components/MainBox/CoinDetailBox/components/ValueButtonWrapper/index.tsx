import { useState } from 'react';
import Typography from '@mui/material/Typography';

import BalanceDisplay from '@/components/BalanceDisplay';
import { useManualBalanceUpdate } from '@/hooks/common/useManualBalanceUpdate';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import type { FlatAccountAssets } from '@/types/accountAssets';
import { isStakeableAsset } from '@/utils/asset';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { BodyBottomContainer, BodyContainer, BodyTopContainer, StyledIconContainer, TotalValueButton, ValueButton } from '../../styled';
import SymbolButton from '../SymbolButton';

import RefreshIcon from '@/assets/images/icons/Refresh18.svg';

interface ValueButtonWrapperProps {
  currentCoin?: FlatAccountAssets;
}

export default function ValueButtonWrapper({ currentCoin }: ValueButtonWrapperProps) {
  const [isBalanceUpdateButtonHovered, setIsBalanceUpdateButtonHovered] = useState(false);

  const { updateChainBalance, isLoadingChainBalance } = useManualBalanceUpdate();
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const coinGeckoId = currentCoin?.asset.coinGeckoId;
  const chainName = currentCoin?.chain.name;
  const balance = currentCoin && isStakeableAsset(currentCoin) ? currentCoin.totalBalance || '0' : currentCoin?.balance || '0';

  const totalDisplayAmount = toDisplayDenomAmount(balance, currentCoin?.asset.decimals || 0);

  const chainPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;
  const totalValue = times(totalDisplayAmount, chainPrice);

  const handleMouseEnterOnValue = () => setIsBalanceUpdateButtonHovered(true);
  const handleMouseLeaveOnValue = () => setIsBalanceUpdateButtonHovered(false);

  const handleManualBalanceUpdate = async () => {
    if (!currentCoin?.chain) return;

    const chainId = getUniqueChainId(currentCoin.chain);

    await updateChainBalance(chainId);
  };

  return (
    <BodyContainer>
      <BodyTopContainer>
        <SymbolButton currentCoin={currentCoin} />

        <ValueButton
          onClick={handleManualBalanceUpdate}
          onMouseEnter={handleMouseEnterOnValue}
          onMouseLeave={handleMouseLeaveOnValue}
          isHovering={isBalanceUpdateButtonHovered}
          leadingIcon={
            isBalanceUpdateButtonHovered || isLoadingChainBalance ? (
              <StyledIconContainer data-is-loading={isLoadingChainBalance}>
                <RefreshIcon />
              </StyledIconContainer>
            ) : undefined
          }
        >
          <BalanceDisplay typoOfIntegers="h1n_B" typoOfDecimals="h2n_M" fixed={6}>
            {totalDisplayAmount}
          </BalanceDisplay>
        </ValueButton>
      </BodyTopContainer>
      <BodyBottomContainer>
        <Typography variant="b3_M">{chainName}</Typography>
        <TotalValueButton
          onMouseEnter={handleMouseEnterOnValue}
          onMouseLeave={handleMouseLeaveOnValue}
          data-is-hovering={isBalanceUpdateButtonHovered}
          onClick={handleManualBalanceUpdate}
        >
          <BalanceDisplay typoOfIntegers="h4n_M" typoOfDecimals="h6n_R" currency={userCurrencyPreference}>
            {totalValue}
          </BalanceDisplay>
        </TotalValueButton>
      </BodyBottomContainer>
    </BodyContainer>
  );
}
