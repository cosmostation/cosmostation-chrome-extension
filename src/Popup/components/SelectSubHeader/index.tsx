import { Suspense, useState } from 'react';

import { ETHEREUM_CHAINS } from '~/constants/chain';
import ChainButton from '~/Popup/components/ChainButton';
import ChainPopover from '~/Popup/components/ChainPopover';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';

import AccountButton from './AccountButton';
import AccountPopover from './AccountPopover';
import NetworkPopover from './NetworkPopover';
import { Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

type SelectSubHeaderProps = {
  isShowChain?: boolean;
};

export default function SelectSubHeader({ isShowChain = true }: SelectSubHeaderProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentChain, setCurrentChain } = useCurrentChain();
  const { currentNetwork } = useCurrentNetwork(currentChain.line === 'ETHEREUM' ? currentChain : ETHEREUM_CHAINS[0]);

  const [popover, setPopover] = useState<'chain' | 'network' | 'account' | null>(null);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  return (
    <Container>
      <LeftContentContainer>
        <AccountButton
          onClick={(event) => {
            setPopover('account');
            setPopoverAnchorEl(event.currentTarget);
          }}
        >
          {currentAccount.name}
        </AccountButton>
      </LeftContentContainer>
      <RightContentContainer>
        {isShowChain && (
          <>
            {currentChain.line === 'ETHEREUM' && (
              <NetworkButton
                onClick={(event) => {
                  setPopover('network');
                  setPopoverAnchorEl(event.currentTarget);
                }}
              >
                {currentNetwork.networkName}
              </NetworkButton>
            )}
            <ChainButton
              imgSrc={currentChain.imageURL}
              onClick={(event) => {
                setPopover('chain');
                setPopoverAnchorEl(event.currentTarget);
              }}
              isActive={isOpenPopover && popover === 'chain'}
            >
              {currentChain.chainName}
            </ChainButton>
          </>
        )}
      </RightContentContainer>

      <ChainPopover
        marginThreshold={0}
        currentChain={currentChain}
        onClickChain={async (chain) => {
          await setCurrentChain(chain);
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
      {currentChain.line === 'ETHEREUM' && (
        <NetworkPopover
          chain={currentChain}
          open={isOpenPopover && popover === 'network'}
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
      )}
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
