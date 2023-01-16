import { Suspense, useMemo, useState } from 'react';

import ChainButton from '~/Popup/components/ChainButton';
import ChainPopover from '~/Popup/components/ChainPopover';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import type { SuiChain } from '~/types/chain';

import AccountButton from '../components/AccountButton';
import AccountPopover from '../components/AccountPopover';
import { Container, LeftContentContainer, RightContentContainer } from '../styled';

type SuiProps = {
  isShowChain: boolean;
  chain: SuiChain;
};

export default function Sui({ chain, isShowChain }: SuiProps) {
  const { currentSuiNetwork, additionalSuiNetworks } = useCurrentSuiNetwork();
  const { currentAccount } = useCurrentAccount();
  const { setCurrentChain } = useCurrentChain();

  const [popover, setPopover] = useState<'chain' | 'network' | 'account' | null>(null);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const isCustom = useMemo(() => !!additionalSuiNetworks.find((item) => item.id === currentSuiNetwork.id), [additionalSuiNetworks, currentSuiNetwork.id]);

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
            imgSrc={currentSuiNetwork.imageURL}
            onClick={(event) => {
              setPopover('chain');
              setPopoverAnchorEl(event.currentTarget);
            }}
            isActive={isOpenPopover && popover === 'chain'}
            isCustom={isCustom}
          >
            {currentSuiNetwork.networkName}
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
