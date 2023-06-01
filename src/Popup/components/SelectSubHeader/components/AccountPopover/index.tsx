import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentTab } from '~/Popup/hooks/SWR/cache/useCurrentTab';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import AccountItemButton from './AccountItemButton';
import { AccountListContainer, BodyContainer, Container, HeaderContainer, HeaderLeftContainer, HeaderRightContainer, StyledIconButton } from './styled';

import SettingIcon24 from '~/images/icons/Setting24.svg';

type AccountPopoverProps = Omit<PopoverProps, 'children'>;

export default function AccountPopover({ onClose, ...remainder }: AccountPopoverProps) {
  const { extensionStorage } = useExtensionStorage();
  const { setCurrentAccount } = useCurrentAccount();
  const { navigate } = useNavigate();

  const { t } = useTranslation();

  const { data } = useAccounts(true);
  const currentTab = useCurrentTab(true);

  const { selectedAccountId, selectedChainId, allowedOrigins } = extensionStorage;

  const { accountName } = extensionStorage;

  return (
    <Popover {...remainder} onClose={onClose}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">{t('pages.Wallet.components.Header.AccountPopover.index.title')}</Typography>
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
                  accountType={account.type}
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
