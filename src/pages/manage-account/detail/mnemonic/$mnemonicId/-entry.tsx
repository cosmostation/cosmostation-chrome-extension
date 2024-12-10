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

import MnemonicAccount from './-components/MnemonicAccount';
import { MainContentBody, MainContentsContainer, MainContentSubtitleText, MainContentTitleText, MnemonicIconContainer, OptionButtonContainer } from './-styled';
import MainContentsLayout from '../../-components/MainContentsLayout';

import EditIcon from '@/assets/images/icons/Edit18.svg';
import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
import MnemonicViewIcon from '@/assets/images/icons/MnemonicView28.svg';

type EntryProps = {
  mnemonicId: string;
};

export default function Entry({ mnemonicId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mnemonicNamesByHashedMnemonic } = useExtensionStorageStore((state) => state);

  const mnemonicName = mnemonicNamesByHashedMnemonic[mnemonicId];

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
                  <MainContentSubtitleText variant="b3_M">{t('pages.manage-account.detail.mnemonic.entry.mnemonicWallet')}</MainContentSubtitleText>
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
                      mnemonicId: mnemonicId,
                    },
                  });
                }}
                leftContent={<MnemonicViewIcon />}
                leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.manage-account.detail.mnemonic.entry.viewMyMnemonic')}</Base1300Text>}
                leftSecondBody={<Base1000Text variant="b3_R">{t('pages.manage-account.detail.mnemonic.entry.viewMyMnemonicDescription')}</Base1000Text>}
              />
            </OptionButtonContainer>
            <MnemonicAccount mnemonicRestoreString={mnemonicId} />
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
