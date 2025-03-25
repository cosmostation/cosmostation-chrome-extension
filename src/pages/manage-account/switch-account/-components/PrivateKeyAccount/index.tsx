import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountImage from '@/components/AccountImage';
import Base1300Text from '@/components/common/Base1300Text';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as Home } from '@/pages/index';
import { toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AccountButton,
  AccountImgContainer,
  AccountInfoContainer,
  AccountLeftContainer,
  AccountRightContainer,
  ActiveBadge,
  BodyContainer,
  Container,
} from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';

export default function PrivateKeyAccount() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentAccount, setCurrentAccount } = useCurrentAccount();

  const { userAccounts, accountNamesById } = useExtensionStorageStore((state) => state);

  const filteredAccounts = userAccounts.filter((item) => item.type === 'PRIVATE_KEY');

  return (
    <Container>
      <BodyContainer>
        {filteredAccounts.map((item, i) => {
          const accountName = accountNamesById[item.id];
          const isCurrentAccount = currentAccount?.id === item.id;

          return (
            <AccountButton
              key={i}
              onClick={() => {
                setCurrentAccount(item.id);

                navigate({
                  to: Home.to,
                });

                toastSuccess(
                  t('pages.manage-account.switch-account.components.switchAccountSuccess', {
                    accountName,
                  }),
                );
              }}
            >
              <AccountLeftContainer>
                <AccountImgContainer>
                  <AccountImage accountId={item.id} />
                </AccountImgContainer>

                <AccountInfoContainer>
                  <Base1300Text variant="b2_M">{accountName}</Base1300Text>
                </AccountInfoContainer>
              </AccountLeftContainer>
              <AccountRightContainer>
                {isCurrentAccount && (
                  <ActiveBadge>
                    <CheckIcon />
                  </ActiveBadge>
                )}
              </AccountRightContainer>
            </AccountButton>
          );
        })}
      </BodyContainer>
    </Container>
  );
}
