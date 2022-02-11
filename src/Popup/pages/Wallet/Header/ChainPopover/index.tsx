import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';

import { BodyContainer, Container, HeaderContainer, HeaderLeftContainer, HeaderRightContainer } from './styled';

type ChainPopoverProps = Omit<PopoverProps, 'children'>;

export default function ChainPopover(props: ChainPopoverProps) {
  return (
    <Popover {...props}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">Select a chain</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer />
        </HeaderContainer>
        <Divider />
        <BodyContainer>egewgwe</BodyContainer>
      </Container>
    </Popover>
  );
}
