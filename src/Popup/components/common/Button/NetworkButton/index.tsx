import { Typography } from '@mui/material';

import { ContentCenterTextContainer, ContentContainer, ContentRightImageContainer, StyledButton } from './styled';

import Change from '~/images/icons/Change.svg';

type NetworkButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export default function NetworkButton({ children, ...remainder }: NetworkButtonProps) {
  return (
    <StyledButton {...remainder}>
      <ContentContainer>
        <ContentCenterTextContainer>
          <Typography variant="h6">{children}</Typography>
        </ContentCenterTextContainer>
        <ContentRightImageContainer>
          <Change />
        </ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
