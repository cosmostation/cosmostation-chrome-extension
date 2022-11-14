import { Suspense, useMemo, useState } from 'react';

import ChainButton from '~/Popup/components/ChainButton';
import ChainPopover from '~/Popup/components/ChainPopover';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import type { AptosChain } from '~/types/chain';

import AccountButton from '../components/AccountButton';
import AccountPopover from '../components/AccountPopover';
import { Container, LeftContentContainer, RightContentContainer } from '../styled';

type AptosProps = {
  isShowChain: boolean;
  chain: AptosChain;
};

export default function Aptos({ chain, isShowChain }: AptosProps) {
  const { currentAptosNetwork, additionalAptosNetworks } = useCurrentAptosNetwork();
  const { currentAccount } = useCurrentAccount();
  const { setCurrentChain } = useCurrentChain();

  const [popover, setPopover] = useState<'chain' | 'network' | 'account' | null>(null);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const isCustom = useMemo(
    () => !!additionalAptosNetworks.find((item) => item.id === currentAptosNetwork.id),
    [additionalAptosNetworks, currentAptosNetwork.id],
  );

  return (
    <Container>
      <LeftContentContainer>
        <AccountButton
          account={currentAccount}
          onClick={(event) => {
            setPopover('account');
            setPopoverAnchorEl(event.currentTarget);
          }}
        />
      </LeftContentContainer>
      <RightContentContainer>
        {isShowChain && (
          <ChainButton
            imgSrc={currentAptosNetwork.imageURL}
            onClick={(event) => {
              setPopover('chain');
              setPopoverAnchorEl(event.currentTarget);
            }}
            isActive={isOpenPopover && popover === 'chain'}
            isCustom={isCustom}
          >
            {currentAptosNetwork.networkName}
          </ChainButton>
        )}
      </RightContentContainer>

      <ChainPopover
        marginThreshold={0}
        currentChain={chain}
        onClickChain={async (selectedChain) => {
          await setCurrentChain(selectedChain);
        }}
        open={isOpenPopover && popover === 'chain'}
        onClose={() => setPopoverAnchorEl(null)}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />

      <Suspense fallback={null}>
        <AccountPopover
          marginThreshold={0}
          open={isOpenPopover && popover === 'account'}
          onClose={() => setPopoverAnchorEl(null)}
          anchorEl={popoverAnchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        />
      </Suspense>
    </Container>
  );
}
