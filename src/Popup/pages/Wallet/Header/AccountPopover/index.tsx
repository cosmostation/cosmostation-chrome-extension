import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { getAddress } from '~/Popup/utils/common';
import { getKeyPair } from '~/Popup/utils/crypto';

import AccountItemButton from './AccountItemButton';
import { AccountListContainer, BodyContainer, Container, HeaderContainer, HeaderLeftContainer, HeaderRightContainer, StyledIconButton } from './styled';

import SettingIcon from '~/images/icons/Setting.svg';

type AccountPopoverProps = Omit<PopoverProps, 'children'>;

export default function AccountPopover({ onClose, ...remainder }: AccountPopoverProps) {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { currentChain } = useCurrentChain();

  const { inMemory } = useInMemory();

  const { accounts, accountName, selectedAccountId } = chromeStorage;

  return (
    <Popover {...remainder} onClose={onClose}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">Select a account</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <StyledIconButton>
              <SettingIcon />
            </StyledIconButton>
          </HeaderRightContainer>
        </HeaderContainer>
        <Divider />
        <BodyContainer>
          <AccountListContainer>
            {accounts.map((account) => {
              const keypair = getKeyPair(account, currentChain, inMemory.password);
              const address = getAddress(currentChain, keypair?.publicKey);
              return (
                <AccountItemButton
                  key={account.id}
                  description={address}
                  isActive={account.id === selectedAccountId}
                  onClick={async () => {
                    await setChromeStorage('selectedAccountId', account.id);
                    onClose?.({}, 'backdropClick');
                  }}
                >
                  {accountName[account.id] ?? ''}
                </AccountItemButton>
              );
            })}
          </AccountListContainer>
        </BodyContainer>
      </Container>
    </Popover>
  );
}
