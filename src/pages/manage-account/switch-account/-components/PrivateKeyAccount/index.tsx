import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountImage from '@/components/AccountImage';
import Base1300Text from '@/components/common/Base1300Text';
import EmptyAsset from '@/components/EmptyAsset';
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
  EmptyAssetContainer,
} from './styled';

import ImportPrivateKeyIcon from '@/assets/images/icons/ImportPrivateKey70.svg';
import CheckIcon from 'assets/images/icons/Check.svg';

type PrivateKeyAccountProps = {
  search?: string;
};

export default function PrivateKeyAccount({ search }: PrivateKeyAccountProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentAccount, setCurrentAccount } = useCurrentAccount();

  const { userAccounts, accountNamesById } = useExtensionStorageStore((state) => state);

  const privateKeyAccounts = userAccounts
    .filter((item) => item.type === 'PRIVATE_KEY')
    .map((item) => ({
      ...item,
      accountName: accountNamesById[item.id],
    }));

  const filteredAccounts = useMemo(() => {
    if (search) {
      return (
        privateKeyAccounts.filter((account) => {
          const condition = [account.accountName];

          return condition.some((item) => item.toLowerCase().indexOf(search.toLowerCase()) > -1);
        }) || []
      );
    }
    return privateKeyAccounts;
  }, [privateKeyAccounts, search]);

  if (filteredAccounts.length === 0) {
    return (
      <EmptyAssetContainer>
        <EmptyAsset
          icon={<ImportPrivateKeyIcon />}
          title={t('pages.manage-account.switch-account.entry.importPrivateKey')}
          subTitle={t('pages.manage-account.switch-account.entry.importPrivateKeyDescription')}
        />
      </EmptyAssetContainer>
    );
  }

  return (
    <Container>
      <BodyContainer>
        {filteredAccounts.map((item, i) => {
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
                    accountName: item.accountName,
                  }),
                );
              }}
            >
              <AccountLeftContainer>
                <AccountImgContainer>
                  <AccountImage accountId={item.id} />
                </AccountImgContainer>

                <AccountInfoContainer>
                  <Base1300Text variant="b2_M">{item.accountName}</Base1300Text>
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
