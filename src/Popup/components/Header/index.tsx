import { Typography } from '@mui/material';

import IconButton from '~/Popup/components/common/IconButton';

import { Container, LeftContentContainer, LeftContentLogoContainer, LeftContentTextContainer, RightContentContainer } from './styled';

import DashboardIcon from '~/images/icons/Dashboard.svg';
import LogoIcon from '~/images/icons/Logo.svg';
import MenuIcon from '~/images/icons/Menu.svg';

export default function Header() {
  return (
    <Container>
      <LeftContentContainer>
        <LeftContentLogoContainer>
          <LogoIcon />
        </LeftContentLogoContainer>
        <LeftContentTextContainer>
          <Typography variant="h4">STATION</Typography>
        </LeftContentTextContainer>
      </LeftContentContainer>
      <RightContentContainer>
        <IconButton>
          <DashboardIcon />
        </IconButton>
        <IconButton>
          <MenuIcon />
        </IconButton>
      </RightContentContainer>
    </Container>
  );
}
