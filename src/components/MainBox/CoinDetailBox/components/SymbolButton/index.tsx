import { useState } from 'react';

import Base1300Text from '@/components/common/Base1300Text';
import type { FlatAccountAssets } from '@/types/accountAssets';

import { CoingeckoIconContainer, SymbolButton as StyledSymbolButton } from '../../styled';

import CoinGeckoIcon from '@/assets/images/icons/CoinGecko20.svg';

interface SymbolButtonProps {
  currentCoin?: FlatAccountAssets;
}

export default function SymbolButton({ currentCoin }: SymbolButtonProps) {
  const [isSymbolButtonHovered, setIsSymbolButtonHovered] = useState(false);

  const coinGeckoUrl = currentCoin?.asset.coinGeckoId ? `https://www.coingecko.com/en/coins/${currentCoin.asset.coinGeckoId}` : '';
  const symbol = currentCoin?.asset.symbol;

  return (
    <StyledSymbolButton
      onMouseEnter={() => setIsSymbolButtonHovered(true)}
      onMouseLeave={() => setIsSymbolButtonHovered(false)}
      onClick={() => coinGeckoUrl && window.open(coinGeckoUrl, '_blank')}
      disabled={!coinGeckoUrl}
      trailingIcon={
        coinGeckoUrl && isSymbolButtonHovered ? (
          <CoingeckoIconContainer>
            <CoinGeckoIcon />
          </CoingeckoIconContainer>
        ) : undefined
      }
    >
      <Base1300Text
        variant="h1_B"
        style={{
          marginRight: '0.2rem',
        }}
      >
        {symbol}
      </Base1300Text>
    </StyledSymbolButton>
  );
}
