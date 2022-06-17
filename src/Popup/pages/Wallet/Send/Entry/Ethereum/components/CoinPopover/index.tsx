import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';

import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import type { Token } from '~/types/ethereum/common';

import CoinItem from './components/CoinItem';
import { Container, StyledPopover } from './styled';

type CoinPopoverProps = Omit<PopoverProps, 'children'> & { currentToken: Token; onClickCoin?: (token: Token) => void };

export default function CoinPopover({ currentToken, onClickCoin, onClose, ...remainder }: CoinPopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const { currentEthereumTokens } = useCurrentEthereumTokens();

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {[null, ...currentEthereumTokens].map((token) => {
          const isActive = currentToken?.id === token?.id;
          return (
            <CoinItem
              key={token?.id || 'native'}
              token={token}
              isActive={isActive}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickCoin?.(token);
                onClose?.({}, 'backdropClick');
              }}
            />
          );
        })}
      </Container>
    </StyledPopover>
  );
}
