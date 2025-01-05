import { ContentsContainer, ContentsInfoContainer, StyledIconButton, WebsiteImageContainer, WebsiteImageWrapper } from './styled';
import StickyFooter from '../BaseLayout/components/BaseStickyFooter';
import Base1000Text from '../common/Base1000Text';
import Base1300Text from '../common/Base1300Text';
import Image from '../common/Image';

import DisconnectIcon from '@/assets/images/icons/Disconnect20.svg';

import WebSiteDefaultImg from '@/assets/images/etc/websiteDefault.png';

export default function ConnectedDapp() {
  const websiteName = 'Osmosis.Zone';
  const websiteUrl = 'https://osmosis.zone';
  const websiteImage = 'https://app.osmosis.zone/images/preview.jpg';

  return (
    <StickyFooter
      leftContent={
        <ContentsContainer>
          <WebsiteImageWrapper>
            <WebsiteImageContainer>
              <Image src={websiteImage} defaultImgSrc={WebSiteDefaultImg} />
            </WebsiteImageContainer>
          </WebsiteImageWrapper>
          <ContentsInfoContainer>
            <Base1300Text variant="b2_M">{websiteName}</Base1300Text>
            <Base1000Text variant="b4_R">{websiteUrl}</Base1000Text>
          </ContentsInfoContainer>
        </ContentsContainer>
      }
      rightContent={
        <StyledIconButton>
          <DisconnectIcon />
        </StyledIconButton>
      }
    />
  );
}
