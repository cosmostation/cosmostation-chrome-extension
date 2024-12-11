import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import Button from '@/components/common/Button/index.tsx';
import IconTextButton from '@/components/common/IconTextButton';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as SwitchWallet } from '@/pages/manage-account/switch-account';
import { Route as ViewPrivateKey } from '@/pages/manage-account/view/privateKey/$accountId';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AccountImgContainer, MainContentBody, MainContentsContainer, MainContentTitleText, OptionButtonContainer } from './-styled';
import MainContentsLayout from '../../../-components/MainContentsLayout';

import EditIcon from '@/assets/images/icons/Edit18.svg';
import PrivateViewIcon from '@/assets/images/icons/PrivateKeyView28.svg';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { accountNamesById } = useExtensionStorageStore((state) => state);
  const { removeAccount } = useCurrentAccount();

  const accountName = accountNamesById[accountId];

  return (
    <>
      <BaseBody>
        <>
          <MainContentsContainer>
            <MainContentsLayout
              top={<AccountImgContainer />}
              body={
                <MainContentBody>
                  <IconTextButton trailingIcon={<EditIcon />}>
                    <MainContentTitleText variant="h2_B">{accountName}</MainContentTitleText>
                  </IconTextButton>
                </MainContentBody>
              }
            />
          </MainContentsContainer>
          <EdgeAligner>
            <OptionButtonContainer>
              <BaseOptionButton
                onClick={() => {
                  navigate({
                    to: ViewPrivateKey.to,
                    params: {
                      accountId,
                    },
                  });
                }}
                leftContent={<PrivateViewIcon />}
                leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.manage-account.detail.privateKey.account.entry.viewPrivateKey')}</Base1300Text>}
                leftSecondBody={
                  <Base1000Text variant="b3_R">{t('pages.manage-account.detail.privateKey.account.entry.viewPrivateKeyDescription')}</Base1000Text>
                }
              />
            </OptionButtonContainer>
          </EdgeAligner>
        </>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={async () => {
            await removeAccount(accountId);
            navigate({ to: SwitchWallet.to });
          }}
          variant="red"
        >
          {t('pages.manage-account.detail.privateKey.account.entry.deleteAccount')}
        </Button>
      </BaseFooter>
    </>
  );
}
