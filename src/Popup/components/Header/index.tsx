import { Typography } from '@mui/material';

import { Container, IconButton, LeftContentContainer, LeftContentLogoContainer, LeftContentTextContainer, RightContentContainer } from './styled';

import DashboardIcon from '~/images/icons/Dashboard.svg';
import LogoIcon from '~/images/icons/Logo.svg';
import SettingIcon from '~/images/icons/Setting.svg';

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
          <SettingIcon />
        </IconButton>
      </RightContentContainer>
    </Container>
  );
}
