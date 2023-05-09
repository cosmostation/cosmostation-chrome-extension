import { useEffect, useRef } from 'react';
import type { PopoverProps } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useTokenBalanceObjectsSWR } from '~/Popup/hooks/SWR/sui/useTokenBalanceObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import type { SuiChain } from '~/types/chain';

import CoinItem from './components/CoinItem';
import { Container, StyledPopover } from './styled';

type CoinPopoverProps = Omit<PopoverProps, 'children'> & { currentCoinType?: string; onClickCoin?: (coinType: string) => void; chain: SuiChain };

export default function CoinPopover({ currentCoinType, onClickCoin, onClose, chain, ...remainder }: CoinPopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { tokenBalanceObjects: suiAvailableCoins } = useTokenBalanceObjectsSWR({ address });

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {suiAvailableCoins.map((coin) => {
          const isActive = currentCoinType === coin.coinType;
          return (
            <CoinItem
              key={coin.coinType}
              coin={coin}
              chain={chain}
              isActive={isActive}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickCoin?.(coin.coinType);
                onClose?.({}, 'backdropClick');
              }}
            />
          );
        })}
      </Container>
    </StyledPopover>
  );
}
