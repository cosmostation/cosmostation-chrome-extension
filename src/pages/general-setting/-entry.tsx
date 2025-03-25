import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import { Route as About } from '@/pages/general-setting/about';
import { Route as AddressBook } from '@/pages/general-setting/address-book';
import { Route as ChangePassword } from '@/pages/general-setting/change-password';
import { Route as ManageCustomNetwork } from '@/pages/general-setting/manage-custom-network';
import { Route as WalletPrioritize } from '@/pages/general-setting/wallet-prioritize';
import { extension } from '@/utils/browser';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import CurrencyBottomSheet from './-components/CurrencyBottomSheet';
import LanguageBottomSheet from './-components/LanguageBottomSheet';
import { Container, OptionButtonContainer, OptionButtonIconContainer, SectionContainer, SectionTitleContainer } from './-styled';

import AbountIcon from '@/assets/images/icons/About28.svg';
import AddressBookIcon from '@/assets/images/icons/AddressBook28.svg';
import AutoLockIcon from '@/assets/images/icons/AutoLock28.svg';
import BackupWalletIcon from '@/assets/images/icons/BackupWallet28.svg';
import ChangePasswordIcon from '@/assets/images/icons/ChangePassword28.svg';
import CurrencyIcon from '@/assets/images/icons/Currency28.svg';
import GuideIcon from '@/assets/images/icons/Guide28.svg';
import LanguageIcon from '@/assets/images/icons/Language28.svg';
import ManageCustomNetworkIcon from '@/assets/images/icons/ManageCustomNetwork28.svg';
import PriceChangeColorIcon from '@/assets/images/icons/PriceChangeColor28.svg';
import PrioritizeIcon from '@/assets/images/icons/PriotizeWallet28.svg';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { version } = extension.runtime.getManifest();

  const [isOpenLanguageBottomSheet, setIsOpenLanguageBottomSheet] = useState(false);
  const [isOpenCurrencyBottomSheet, setIsOpenCurrencyBottomSheet] = useState(false);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <Container>
            <SectionContainer>
              <SectionTitleContainer>
                <Base1300Text variant="h4_B">{t('pages.general-setting.entry.security')} </Base1300Text>
                <Base1000Text variant="h4_B">{'3'}</Base1000Text>
              </SectionTitleContainer>
              <OptionButtonContainer>
                <BaseOptionButton
                  leftContent={
                    <OptionButtonIconContainer>
                      <BackupWalletIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.backupWallet')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.backupWalletDescription')}</Base1000Text>}
                />
                <BaseOptionButton
                  onClick={() => {
                    navigate({
                      to: ChangePassword.to,
                    });
                  }}
                  leftContent={
                    <OptionButtonIconContainer>
                      <ChangePasswordIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.changePassword')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.changePasswordDescription')}</Base1000Text>}
                />
                <BaseOptionButton
                  leftContent={
                    <OptionButtonIconContainer>
                      <AutoLockIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.setAutoLock')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.setAutoLockDescription')}</Base1000Text>}
                  rightContent={<Base1000Text variant="h6n_M">{'60 Min'}</Base1000Text>}
                />
              </OptionButtonContainer>
            </SectionContainer>

            <SectionContainer>
              <SectionTitleContainer>
                <Base1300Text variant="h4_B">{t('pages.general-setting.entry.wallet')} </Base1300Text>
                <Base1000Text variant="h4_B">{'3'}</Base1000Text>
              </SectionTitleContainer>
              <OptionButtonContainer>
                <BaseOptionButton
                  onClick={() => {
                    navigate({
                      to: AddressBook.to,
                    });
                  }}
                  leftContent={
                    <OptionButtonIconContainer>
                      <AddressBookIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.addressBook')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.addressBookDescription')}</Base1000Text>}
                />
                <BaseOptionButton
                  onClick={() => {
                    navigate({
                      to: ManageCustomNetwork.to,
                    });
                  }}
                  leftContent={
                    <OptionButtonIconContainer>
                      <ManageCustomNetworkIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.manageCustomNetwork')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.manageCustomNetworkDescription')}</Base1000Text>}
                />
                <BaseOptionButton
                  onClick={() => {
                    navigate({
                      to: WalletPrioritize.to,
                    });
                  }}
                  leftContent={
                    <OptionButtonIconContainer>
                      <PrioritizeIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.prioritize')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.prioritizeDescription')}</Base1000Text>}
                />
              </OptionButtonContainer>
            </SectionContainer>

            <SectionContainer>
              <SectionTitleContainer>
                <Base1300Text variant="h4_B">{t('pages.general-setting.entry.preference')} </Base1300Text>
                <Base1000Text variant="h4_B">{'3'}</Base1000Text>
              </SectionTitleContainer>
              <OptionButtonContainer>
                <BaseOptionButton
                  onClick={() => {
                    setIsOpenLanguageBottomSheet(true);
                  }}
                  leftContent={
                    <OptionButtonIconContainer>
                      <LanguageIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.language')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.languageDescription')}</Base1000Text>}
                />
                <BaseOptionButton
                  onClick={() => {
                    setIsOpenCurrencyBottomSheet(true);
                  }}
                  leftContent={
                    <OptionButtonIconContainer>
                      <CurrencyIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.currency')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.currencyDescription')}</Base1000Text>}
                  rightContent={<Base1000Text variant="h6n_M">{userCurrencyPreference.toUpperCase()}</Base1000Text>}
                />
                <BaseOptionButton
                  leftContent={
                    <OptionButtonIconContainer>
                      <PriceChangeColorIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.priceChangeColor')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.priceChangeColorDescription')}</Base1000Text>}
                  rightContent={<Base1000Text variant="h6n_M">{'60 Min'}</Base1000Text>}
                />
              </OptionButtonContainer>
            </SectionContainer>

            <SectionContainer>
              <SectionTitleContainer>
                <Base1300Text variant="h4_B">{t('pages.general-setting.entry.support')} </Base1300Text>
                <Base1000Text variant="h4_B">{'2'}</Base1000Text>
              </SectionTitleContainer>
              <OptionButtonContainer>
                <BaseOptionButton
                  onClick={() => {
                    window.open('https://cosmostation.gitbook.io/cosmostation-documents/user-guide/cosmostation-extension', '_blank');
                  }}
                  leftContent={
                    <OptionButtonIconContainer>
                      <GuideIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.guide')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.guideDescription')}</Base1000Text>}
                />
                <BaseOptionButton
                  onClick={() => {
                    navigate({
                      to: About.to,
                    });
                  }}
                  leftContent={
                    <OptionButtonIconContainer>
                      <AbountIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.about')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.aboutDescription')}</Base1000Text>}
                  rightContent={<Base1000Text variant="h6n_M">{`V ${version}`}</Base1000Text>}
                />
              </OptionButtonContainer>
            </SectionContainer>
          </Container>
        </EdgeAligner>
      </BaseBody>
      <LanguageBottomSheet open={isOpenLanguageBottomSheet} onClose={() => setIsOpenLanguageBottomSheet(false)} />
      <CurrencyBottomSheet open={isOpenCurrencyBottomSheet} onClose={() => setIsOpenCurrencyBottomSheet(false)} />
    </>
  );
}
