import { Typography } from '@mui/material';

import { ContentCenterTextContainer, ContentContainer, ContentRightImageContainer, StyledButton } from './styled';

import Change from '~/images/icons/Change.svg';

type NetworkButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & { children?: string };

export default function NetworkButton({ children, ...remainder }: NetworkButtonProps) {
  const networkName = children ? `${children.substring(0, 1).toUpperCase()}${children.substring(1).toLowerCase()}` : '';
  return (
    <StyledButton {...remainder}>
      <ContentContainer>
        <ContentCenterTextContainer>
          <Typography variant="h6">{networkName}</Typography>
        </ContentCenterTextContainer>
        <ContentRightImageContainer>
          <Change />
        </ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
