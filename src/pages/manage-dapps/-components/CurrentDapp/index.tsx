import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';

import { Container, ContentsContainer, ContentsInfoContainer, TopContainer, WebsiteImageContainer, WebsiteImageWrapper } from './styled';

export default function CurrentDapp() {
  const { t } = useTranslation();

  const websiteName = 'Osmosis.Zone';
  const websiteUrl = 'https://osmosis.zone';
  const websiteImage = 'https://app.osmosis.zone/images/preview.jpg';

  return (
    <Container>
      <TopContainer>
        <Base1000Text variant="b3_R">{t('pages.manage-dapps.components.CurrentDapp.index.currentDapp')}</Base1000Text>
      </TopContainer>
      <ContentsContainer>
        <WebsiteImageWrapper>
          <WebsiteImageContainer>
            <Image src={websiteImage} />
          </WebsiteImageContainer>
        </WebsiteImageWrapper>
        <ContentsInfoContainer>
          <Base1300Text variant="h2_B">{websiteName}</Base1300Text>
          <Base1000Text variant="b3_R">{websiteUrl}</Base1000Text>
        </ContentsInfoContainer>
      </ContentsContainer>
    </Container>
  );
}
