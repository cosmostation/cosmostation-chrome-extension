import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentTab } from '~/Popup/hooks/SWR/cache/useCurrentTab';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useNavigate } from '~/Popup/hooks/useNavigate';

import AccountItemButton from './AccountItemButton';
import { AccountListContainer, BodyContainer, Container, HeaderContainer, HeaderLeftContainer, HeaderRightContainer, StyledIconButton } from './styled';

import SettingIcon24 from '~/images/icons/Setting24.svg';

type AccountPopoverProps = Omit<PopoverProps, 'children'>;

export default function AccountPopover({ onClose, ...remainder }: AccountPopoverProps) {
  const { chromeStorage } = useChromeStorage();
  const { setCurrentAccount } = useCurrentAccount();
  const { navigate } = useNavigate();

  const { data } = useAccounts(true);
  const currentTab = useCurrentTab(true);

  const { selectedAccountId, selectedChainId, allowedOrigins } = chromeStorage;

  const { accountName } = chromeStorage;

  return (
    <Popover {...remainder} onClose={onClose}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">Select a account</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <StyledIconButton onClick={() => navigate('/account/management')}>
              <SettingIcon24 />
            </StyledIconButton>
          </HeaderRightContainer>
        </HeaderContainer>
        <Divider />
        <BodyContainer>
          <AccountListContainer>
            {data?.map((account) => {
              const specificAllowedOrigins = allowedOrigins.filter((item) => item.accountId === account.id).map((item) => item.origin);

              const isConnected = currentTab.data?.origin ? specificAllowedOrigins.includes(currentTab.data.origin) : undefined;

              return (
                <AccountItemButton
                  key={account.id}
                  description={account.address[selectedChainId] || ''}
                  isActive={account.id === selectedAccountId}
                  isConnected={isConnected}
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
