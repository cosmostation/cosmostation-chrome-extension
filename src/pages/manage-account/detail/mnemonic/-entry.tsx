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
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import MnemonicAccount from './-components/MnemonicAccount';
import { MainContentBody, MainContentsContainer, MainContentSubtitleText, MainContentTitleText, MnemonicIconContainer, OptionButtonContainer } from './-styled';
import MainContentsLayout from '../-components/MainContentsLayout';

import EditIcon from '@/assets/images/icons/Edit18.svg';
import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
import MnemonicViewIcon from '@/assets/images/icons/MnemonicView28.svg';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mnemonicNamesByHashedMnemonic } = useExtensionStorageStore((state) => state);

  const mnemonicName =
    mnemonicNamesByHashedMnemonic[
      'c37b134dcf0daa6fb42b82261b56d835fee00ebc369c63860046b9e84d9c57928a5a366d6619e1a4faa14c414c119b659fe9acd04ad9d898228e5bf22e5440db'
    ];

  return (
    <>
      <BaseBody>
        <>
          <MainContentsContainer>
            <MainContentsLayout
              top={
                <MnemonicIconContainer>
                  <MnemonicIcon />
                </MnemonicIconContainer>
              }
              body={
                <MainContentBody>
                  <IconTextButton trailingIcon={<EditIcon />}>
                    <MainContentTitleText variant="h2_B">{mnemonicName}</MainContentTitleText>
                  </IconTextButton>
                  <MainContentSubtitleText variant="b3_M">{t('pages.manage-account.detail.mnemonic.entry.deleteMnemonic')}</MainContentSubtitleText>
                </MainContentBody>
              }
            />
          </MainContentsContainer>
          <EdgeAligner>
            <OptionButtonContainer>
              <BaseOptionButton
                leftContent={<MnemonicViewIcon />}
                leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.manage-account.detail.mnemonic.entry.viewMyMnemonic')}</Base1300Text>}
                leftSecondBody={<Base1000Text variant="b3_R">{t('pages.manage-account.detail.mnemonic.entry.viewMyMnemonicDescription')}</Base1000Text>}
              />
            </OptionButtonContainer>
            <MnemonicAccount
              mnemonicRestoreString={
                'c37b134dcf0daa6fb42b82261b56d835fee00ebc369c63860046b9e84d9c57928a5a366d6619e1a4faa14c414c119b659fe9acd04ad9d898228e5bf22e5440db'
              }
            />
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
          {t('pages.manage-account.detail.mnemonic.entry.deleteMnemonic')}
        </Button>
      </BaseFooter>
    </>
  );
}
