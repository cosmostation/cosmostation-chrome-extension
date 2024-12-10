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
import { Route as SwitchWallet } from '@/pages/manage-account/switch-account';
import { Route as ViewMnemonic } from '@/pages/manage-account/view/mnemonic/$mnemonicId';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AccountImgContainer, MainContentBody, MainContentsContainer, MainContentSubtitleText, MainContentTitleText, OptionButtonContainer } from './-styled';
import MainContentsLayout from '../../../-components/MainContentsLayout';

import EditIcon from '@/assets/images/icons/Edit18.svg';
import MnemonicViewIcon from '@/assets/images/icons/MnemonicView28.svg';
import PrivateViewIcon from '@/assets/images/icons/PrivateKeyView28.svg';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { accounts, accountNamesById } = useExtensionStorageStore((state) => state);

  const account = accounts.find((item) => item.id === accountId);
  const hdPath = account?.type === 'MNEMONIC' ? account.index : '';
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
                  <MainContentSubtitleText variant="b3_R">{`${t('pages.manage-account.detail.mnemonic.account.entry.lastHdPath')} : ${hdPath}`}</MainContentSubtitleText>
                </MainContentBody>
              }
            />
          </MainContentsContainer>
          <EdgeAligner>
            <OptionButtonContainer>
              <BaseOptionButton
                onClick={() => {
                  navigate({
                    to: ViewMnemonic.to,
                    params: {
                      mnemonicId: account?.encryptedRestoreString || '',
                    },
                  });
                }}
                leftContent={<MnemonicViewIcon />}
                leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.manage-account.detail.mnemonic.account.entry.viewMyMnemonic')}</Base1300Text>}
                leftSecondBody={<Base1000Text variant="b3_R">{t('pages.manage-account.detail.mnemonic.account.entry.viewMyMnemonicDescription')}</Base1000Text>}
              />
              <BaseOptionButton
                leftContent={<PrivateViewIcon />}
                leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.manage-account.detail.mnemonic.account.entry.viewPrivateKey')}</Base1300Text>}
                leftSecondBody={<Base1000Text variant="b3_R">{t('pages.manage-account.detail.mnemonic.account.entry.viewPrivateKeyDescription')}</Base1000Text>}
              />
            </OptionButtonContainer>
          </EdgeAligner>
        </>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={() => {
            navigate({ to: SwitchWallet.to });
          }}
          variant="red"
        >
          {t('pages.manage-account.detail.mnemonic.account.entry.deleteAccount')}
        </Button>
      </BaseFooter>
    </>
  );
}
