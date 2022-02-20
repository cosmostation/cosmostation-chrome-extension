import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import { CHAINS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrent } from '~/Popup/hooks/useCurrent';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { getAddress } from '~/Popup/utils/common';
import { getKeyPair } from '~/Popup/utils/crypto';

import AccountItemButton from './AccountItemButton';
import { AccountListContainer, BodyContainer, Container, HeaderContainer, HeaderLeftContainer, HeaderRightContainer, StyledIconButton } from './styled';

import SettingIcon from '~/images/icons/Setting.svg';

type AccountPopoverProps = Omit<PopoverProps, 'children'>;

export default function AccountPopover({ onClose, ...remainder }: AccountPopoverProps) {
  const { chromeStorage } = useChromeStorage();
  const { setCurrentAccount } = useCurrent();

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
              const accountChainId = chromeStorage.selectedChainId[account.id];
              const accountChain = CHAINS.find((chain) => chain.id === accountChainId)!;
              const keypair = getKeyPair(account, accountChain, inMemory.password);
              const address = getAddress(accountChain, keypair?.publicKey);
              return (
                <AccountItemButton
                  key={account.id}
                  description={address}
                  isActive={account.id === selectedAccountId}
                  onClick={async () => {
                    await setCurrentAccount(account.id);
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
