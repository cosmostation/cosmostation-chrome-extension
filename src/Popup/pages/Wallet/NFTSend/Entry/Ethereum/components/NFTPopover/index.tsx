import { useEffect, useMemo, useRef } from 'react';
import type { PopoverProps } from '@mui/material';

import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';

import NFTItem from './components/NFTItem';
import { Container, StyledPopover } from './styled';

type NFTPopoverProps = Omit<PopoverProps, 'children'> & { currentNFTId?: string; onClickNFT?: (nftObjectId: string) => void };

export default function NFTPopover({ currentNFTId, onClickNFT, onClose, ...remainder }: NFTPopoverProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const { currentEthereumNFTs } = useCurrentEthereumNFTs();

  const filteredNFTObjects = useMemo(() => currentEthereumNFTs.filter((item) => item.tokenType === 'ERC721'), [currentEthereumNFTs]);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {filteredNFTObjects.map((nft) => {
          const isActive = currentNFTId === nft.id;
          return (
            <NFTItem
              key={nft.id}
              nft={nft}
              isActive={isActive}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickNFT?.(nft.id);
                onClose?.({}, 'backdropClick');
              }}
            />
          );
        })}
      </Container>
    </StyledPopover>
  );
}
