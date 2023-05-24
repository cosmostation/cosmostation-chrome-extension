import { useEffect, useMemo, useRef } from 'react';
import type { PopoverProps } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useNFTObjectsSWR } from '~/Popup/hooks/SWR/sui/useNFTObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import type { SuiChain } from '~/types/chain';

import NFTItem from './components/NFTItem';
import { Container, StyledPopover } from './styled';

type NFTPopoverProps = Omit<PopoverProps, 'children'> & { currentNFTObjectId?: string; onClickNFT?: (nftObjectId: string) => void; chain: SuiChain };

export default function NFTPopover({ currentNFTObjectId, onClickNFT, onClose, chain, ...remainder }: NFTPopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts(true);

  const address = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '';

  const { nftObjects } = useNFTObjectsSWR({ address });

  const filteredNFTObjects = useMemo(
    () => nftObjects.filter((item) => item.data?.content?.dataType === 'moveObject' && item.data.content.hasPublicTransfer),
    [nftObjects],
  );

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {filteredNFTObjects.map((nftObject) => {
          const isActive = currentNFTObjectId === nftObject.data?.objectId;
          return (
            <NFTItem
              key={nftObject.data?.objectId}
              nftObject={nftObject}
              chain={chain}
              isActive={isActive}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickNFT?.(nftObject.data?.objectId || '');
                onClose?.({}, 'backdropClick');
              }}
            />
          );
        })}
      </Container>
    </StyledPopover>
  );
}
