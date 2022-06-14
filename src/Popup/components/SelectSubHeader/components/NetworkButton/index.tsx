import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';

import { ContentCenterTextContainer, ContentContainer, ContentLeftImageContainer, ContentRightImageContainer, StyledButton } from './styled';

import Change from '~/images/icons/Change.svg';

type NetworkButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & { children?: string };

export default function NetworkButton({ children, ...remainder }: NetworkButtonProps) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  return (
    <StyledButton {...remainder}>
      <ContentContainer>
        <ContentLeftImageContainer>
          <Image src={currentEthereumNetwork.imageURL} />
        </ContentLeftImageContainer>
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
