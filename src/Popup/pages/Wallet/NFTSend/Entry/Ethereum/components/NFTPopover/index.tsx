import { useEffect, useMemo, useRef } from 'react';
import type { PopoverProps } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNFTs } from '~/Popup/hooks/useCurrent/useCurrentEthereumNFTs';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumNFT } from '~/types/ethereum/nft';

import NFTItem from './components/NFTItem';
import { Container, StyledPopover } from './styled';

type NFTPopoverProps = Omit<PopoverProps, 'children'> & { currentNFT?: EthereumNFT; onClickNFT?: (nft: EthereumNFT) => void };

export default function NFTPopover({ currentNFT, onClickNFT, onClose, ...remainder }: NFTPopoverProps) {
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts();

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const ref = useRef<HTMLButtonElement>(null);

  const { currentEthereumNFTs } = useCurrentEthereumNFTs();

  const filteredNFTs = useMemo(
    () => currentEthereumNFTs.filter((item) => isEqualsIgnoringCase(item.ownerAddress, currentAddress)),
    [currentAddress, currentEthereumNFTs],
  );

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledPopover onClose={onClose} {...remainder}>
      <Container>
        {filteredNFTs.map((nft) => {
          const isActive = currentNFT?.id === nft.id;
          return (
            <NFTItem
              key={nft.id}
              nft={nft}
              isActive={isActive}
              ref={isActive ? ref : undefined}
              onClick={() => {
                onClickNFT?.(nft);
                onClose?.({}, 'backdropClick');
              }}
            />
          );
        })}
      </Container>
    </StyledPopover>
  );
}
