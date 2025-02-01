// import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useActiveTabInfo } from '@/hooks/current/useActiveTabInfo';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { getSiteTitle } from '@/utils/website';

import { Container, ContentsContainer, ContentsInfoContainer, TopContainer, WebsiteImageContainer, WebsiteImageWrapper } from './styled';

import WebsiteDefaultImg from 'assets/images/default/websiteDefault.png';

export default function CurrentDapp() {
  const { t } = useTranslation();

  const { data: activeTabInfo } = useActiveTabInfo();

  const { currentAccountApporvedOrigins } = useCurrentAccount();

  const origin = activeTabInfo?.origin || '';

  const isConnected = currentAccountApporvedOrigins.map((item) => item.origin).includes(origin);

  const { siteIconURL } = useSiteIconURL(isConnected ? origin : '');
  const siteTitle = getSiteTitle(origin);

  if (!origin || !isConnected) {
    return null;
  }

  return (
    <Container>
      <TopContainer>
        <Base1000Text variant="b3_R">{t('pages.manage-dapps.components.CurrentDapp.index.currentDapp')}</Base1000Text>
      </TopContainer>
      <ContentsContainer>
        <WebsiteImageWrapper>
          <WebsiteImageContainer>
            <Image src={siteIconURL} defaultImgSrc={WebsiteDefaultImg} />
          </WebsiteImageContainer>
        </WebsiteImageWrapper>
        <ContentsInfoContainer>
          <Base1300Text variant="h2_B">{siteTitle}</Base1300Text>
          <Base1000Text variant="b3_R">{origin}</Base1000Text>
        </ContentsInfoContainer>
      </ContentsContainer>
    </Container>
  );
}
