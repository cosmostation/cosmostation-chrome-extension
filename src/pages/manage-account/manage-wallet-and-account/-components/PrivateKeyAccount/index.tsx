import { useNavigate } from '@tanstack/react-router';

import Base1300Text from '@/components/common/Base1300Text';
import { Route as PrivateKeyAccountDetail } from '@/pages/manage-account/detail/privateKey/account/$accountId';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AccountButton, AccountImgContainer, AccountInfoContainer, AccountLeftContainer, AccountRightContainer, BodyContainer, Container } from './styled';

import OrderIcon from 'assets/images/icons/Order20.svg';

export default function PrivateKeyAccount() {
  const navigate = useNavigate();

  const { accounts, accountNamesById } = useExtensionStorageStore((state) => state);

  const filteredAccounts = accounts.filter((item) => item.type === 'PRIVATE_KEY');

  return (
    <Container>
      <BodyContainer>
        {filteredAccounts.map((item, i) => {
          const accountName = accountNamesById[item.id];

          return (
            <AccountButton
              key={i}
              onClick={() => {
                navigate({
                  to: PrivateKeyAccountDetail.to,
                  params: {
                    accountId: item.id,
                  },
                });
              }}
            >
              <AccountLeftContainer>
                <AccountImgContainer />

                <AccountInfoContainer>
                  <Base1300Text variant="b2_M">{accountName}</Base1300Text>
                </AccountInfoContainer>
              </AccountLeftContainer>
              <AccountRightContainer>
                <OrderIcon />
              </AccountRightContainer>
            </AccountButton>
          );
        })}
      </BodyContainer>
    </Container>
  );
}
