import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountImage from '@/components/AccountImage';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import EmptyAsset from '@/components/EmptyAsset';
import VerifyPasswordBottomSheet from '@/components/VerifyPasswordBottomSheet';
import { Route as ViewPrivateKey } from '@/pages/manage-account/view/privateKey/$accountId';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AccountImgContainer, BodyContainer, Container, EmptyAssetContainer } from './styled';

import ImportPrivateKeyIcon from '@/assets/images/icons/ImportPrivateKey70.svg';

export default function PrivateKeyAccountList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userAccounts, accountNamesById } = useExtensionStorageStore((state) => state);

  const [supposedToBackupAccountId, setSupposedToBackupAccountId] = useState<string | undefined>();

  const filteredAccounts = userAccounts.filter((item) => item.type === 'PRIVATE_KEY');

  return (
    <>
      <Container>
        <BodyContainer>
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((item) => {
              const accountName = accountNamesById[item.id];

              return (
                <BaseOptionButton
                  key={item.id}
                  onClick={() => {
                    setSupposedToBackupAccountId(item.id);
                  }}
                  leftContent={
                    <AccountImgContainer>
                      <AccountImage accountId={item.id} />
                    </AccountImgContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{accountName}</Base1300Text>}
                  style={{
                    padding: '1.6rem',
                  }}
                />
              );
            })
          ) : (
            <EmptyAssetContainer>
              <EmptyAsset
                icon={<ImportPrivateKeyIcon />}
                title={t('pages.general-setting.backup-wallet.components.PrivateKeyList.index.noPrivateKey')}
                subTitle={t('pages.general-setting.backup-wallet.components.PrivateKeyList.index.noPrivateDescription')}
              />
            </EmptyAssetContainer>
          )}
        </BodyContainer>
      </Container>
      <VerifyPasswordBottomSheet
        open={!!supposedToBackupAccountId}
        onClose={() => setSupposedToBackupAccountId(undefined)}
        onSubmit={() => {
          navigate({
            to: ViewPrivateKey.to,
            params: {
              accountId: supposedToBackupAccountId || '',
            },
          });
        }}
      />
    </>
  );
}
