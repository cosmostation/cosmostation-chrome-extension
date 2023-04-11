import { useEffect, useMemo, useRef } from 'react';
import type { PopoverProps } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetAllBalancesSWR } from '~/Popup/hooks/SWR/sui/useGetAllBalancesSWR';
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

  // const { data: objectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({ address }, { suspense: true });

  // const { data: objects } = useGetObjectsSWR({ objectIds: objectsOwnedByAddress?.result?.map((object) => object.objectId) }, { suspense: true });
  const { data: allBalances } = useGetAllBalancesSWR({ address }, { suspense: true });

  const suiCoinObjects = useMemo(() => allBalances?.result || [], [allBalances?.result]);

  const suiCoinNames = useMemo(() => suiCoinObjects.map((object) => object.coinType), [suiCoinObjects]);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {suiCoinNames.map((coinType) => {
          const isActive = currentCoinType === coinType;
          return (
            <CoinItem
              key={coinType || 'native'}
              coinType={coinType}
              chain={chain}
              isActive={isActive}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickCoin?.(coinType);
                onClose?.({}, 'backdropClick');
              }}
            />
          );
        })}
      </Container>
    </StyledPopover>
  );
}
