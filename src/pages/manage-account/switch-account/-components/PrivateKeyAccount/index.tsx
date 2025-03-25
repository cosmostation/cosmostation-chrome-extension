import AccountImage from '@/components/AccountImage';
import Base1300Text from '@/components/common/Base1300Text';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
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
