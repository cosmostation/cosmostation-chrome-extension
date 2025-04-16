import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import { extension } from '@/utils/browser';

import { AppContainer, AppIconImageContainer, AppVersionText, ButtonContainer, ButtonIconContainer, Container, StickyContainer } from './-styled';

import GithubIcon from '@/assets/images/icons/Github28.svg';
import PrivacyIcon from '@/assets/images/icons/Privacy28.svg';
import ServiceIcon from '@/assets/images/icons/Service28.svg';
import WebsiteIcon from '@/assets/images/icons/Website28.svg';
import XIcon from '@/assets/images/icons/X28.svg';

import appIconImage from '@/assets/images/logos/appIcon.png';

export default function Entry() {
  const { t } = useTranslation();

  const { version } = extension.runtime.getManifest();

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <StickyContainer>
            <AppContainer>
              <AppIconImageContainer src={appIconImage} />
              <AppVersionText variant="h2_B">{'COSMOSTATION'}</AppVersionText>
              <Base1000Text variant="b3_M">{`V ${version}`}</Base1000Text>
            </AppContainer>
          </StickyContainer>
          <ButtonContainer>
            <BaseOptionButton
              onClick={() => {
                window.open('https://www.cosmostation.io/service_en?target=service', '_blank');
              }}
              leftContent={
                <ButtonIconContainer>
                  <ServiceIcon />
                </ButtonIconContainer>
              }
              leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.about.entry.termsOfService')}</Base1300Text>}
              leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.about.entry.termsOfServiceDescription')}</Base1000Text>}
            />
            <BaseOptionButton
              onClick={() => {
                window.open('https://www.cosmostation.io/service_en?target=privacy', '_blank');
              }}
              leftContent={
                <ButtonIconContainer>
                  <PrivacyIcon />
                </ButtonIconContainer>
              }
              leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.about.entry.privacy')}</Base1300Text>}
              leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.about.entry.privacyDescription')}</Base1000Text>}
            />
            <BaseOptionButton
              onClick={() => {
                window.open('https://github.com/cosmostation/cosmostation-chrome-extension', '_blank');
              }}
              leftContent={
                <ButtonIconContainer>
                  <GithubIcon />
                </ButtonIconContainer>
              }
              leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.about.entry.github')}</Base1300Text>}
              leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.about.entry.githubDescription')}</Base1000Text>}
            />
            <BaseOptionButton
              onClick={() => {
                window.open('https://www.cosmostation.io', '_blank');
              }}
              leftContent={
                <ButtonIconContainer>
                  <WebsiteIcon />
                </ButtonIconContainer>
              }
              leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.about.entry.homepage')}</Base1300Text>}
              leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.about.entry.homepageDescription')}</Base1000Text>}
            />
            <BaseOptionButton
              onClick={() => {
                window.open('https://x.com/IBCwallet', '_blank');
              }}
              leftContent={
                <ButtonIconContainer>
                  <XIcon />
                </ButtonIconContainer>
              }
              leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.general-setting.about.entry.x')}</Base1300Text>}
              leftSecondBody={<Base1000Text variant="b3_R">{t('pages.general-setting.about.entry.xDescription')}</Base1000Text>}
            />
          </ButtonContainer>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
