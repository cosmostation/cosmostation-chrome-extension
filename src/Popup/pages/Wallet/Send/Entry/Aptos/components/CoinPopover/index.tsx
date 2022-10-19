import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';

import { useCurrentAptosCoins } from '~/Popup/hooks/useCurrent/useCurrentAptosCoins';
import type { X1CoinCoinstore } from '~/types/aptos/accounts';

import CoinItem from './components/CoinItem';
import { Container, StyledPopover } from './styled';

type CoinPopoverProps = Omit<PopoverProps, 'children'> & { currentCoin?: X1CoinCoinstore; onClickCoin?: (coin: X1CoinCoinstore) => void };

export default function CoinPopover({ currentCoin, onClickCoin, onClose, ...remainder }: CoinPopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const { currentAptosCoins } = useCurrentAptosCoins();

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {currentAptosCoins.map((coin) => {
          const isActive = currentCoin?.type === coin.type;
          return (
            <CoinItem
              key={coin.type || 'native'}
              coin={coin}
              isActive={isActive}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickCoin?.(coin);
                onClose?.({}, 'backdropClick');
              }}
            />
          );
        })}
      </Container>
    </StyledPopover>
  );
}
