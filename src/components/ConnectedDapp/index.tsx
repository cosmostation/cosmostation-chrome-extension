import { useNavigate } from '@tanstack/react-router';

import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useActiveTabInfo } from '@/hooks/current/useActiveTabInfo';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as ManageDapps } from '@/pages/manage-dapps';
import { getSiteTitle } from '@/utils/website';

import { ContentsContainer, ContentsInfoContainer, StyledIconButton } from './styled';
import StickyFooter from '../BaseLayout/components/BaseStickyFooter';
import Base1000Text from '../common/Base1000Text';
import Base1300Text from '../common/Base1300Text';
import ConnectedWebsiteImage from '../ConnectedWebsiteImage';

import DisconnectIcon from '@/assets/images/icons/Disconnect20.svg';

export default function ConnectedDapp() {
  const navigate = useNavigate();
  const { data: activeTabInfo } = useActiveTabInfo();

  const { currentAccountApporvedOrigins, removeApprovedOrigin } = useCurrentAccount();

  const origin = activeTabInfo?.origin || '';

  const isConnected = currentAccountApporvedOrigins.map((item) => item.origin).includes(origin);

  const { siteIconURL } = useSiteIconURL(isConnected ? origin : '');
  const siteTitle = getSiteTitle(origin);

  if (!origin || !isConnected) {
    return null;
  }
  return (
    <StickyFooter
      leftContent={
        <ContentsContainer>
          <ConnectedWebsiteImage
            image={siteIconURL}
            style={{
              width: '3.5rem',
              height: '3.5rem',
            }}
          />
          <ContentsInfoContainer>
            <Base1300Text variant="b2_M">{siteTitle}</Base1300Text>
            <Base1000Text variant="b4_R">{origin}</Base1000Text>
          </ContentsInfoContainer>
        </ContentsContainer>
      }
      rightContent={
        <StyledIconButton
          onClick={(e) => {
            e.stopPropagation();
            removeApprovedOrigin(origin);
          }}
        >
          <DisconnectIcon />
        </StyledIconButton>
      }
      onClick={() => {
        navigate({
          to: ManageDapps.to,
        });
      }}
    />
  );
}
