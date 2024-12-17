import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';

import LanguageBottomSheet from './-components/LanguageBottomSheet';
import { Container, OptionButtonContainer, OptionButtonIconContainer, SectionContainer, SectionTitleContainer } from './-styled';

import AutoLockIcon from '@/assets/images/icons/AutoLock28.svg';
import BackupWalletIcon from '@/assets/images/icons/BackupWallet28.svg';
import ChangePasswordIcon from '@/assets/images/icons/ChangePassword28.svg';
import CurrencyIcon from '@/assets/images/icons/Currency28.svg';
import LanguageIcon from '@/assets/images/icons/Language28.svg';
import PriceChangeColorIcon from '@/assets/images/icons/PriceChangeColor28.svg';

export default function Entry() {
  const { t } = useTranslation();

  const [isOpenLanguageBottomSheet, setIsOpenLanguageBottomSheet] = useState(false);

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
                  leftContent={
                    <OptionButtonIconContainer>
                      <CurrencyIcon />
                    </OptionButtonIconContainer>
                  }
                  leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.entry.currency')}</Base1300Text>}
                  leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.entry.currencyDescription')}</Base1000Text>}
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
          </Container>
        </EdgeAligner>
      </BaseBody>
      <LanguageBottomSheet open={isOpenLanguageBottomSheet} onClose={() => setIsOpenLanguageBottomSheet(false)} />
    </>
  );
}
