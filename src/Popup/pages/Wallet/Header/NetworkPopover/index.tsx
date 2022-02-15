import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';

import NetworkItemButton from './NetworkItemButton';
import {
  BetaNetworkContainer,
  BetaNetworkListContainer,
  BetaNetworkTitleContainer,
  BodyContainer,
  Container,
  HeaderContainer,
  HeaderLeftContainer,
  HeaderRightContainer,
  NetworkListContainer,
} from './styled';

type NetworkPopoverProps = Omit<PopoverProps, 'children'>;

export default function NetworkPopover(props: NetworkPopoverProps) {
  return (
    <Popover {...props}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">Select a network</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer />
        </HeaderContainer>
        <Divider />
        <BodyContainer>
          <NetworkListContainer>
            <NetworkItemButton isActive imgSrc="https://">
              Cosmos
            </NetworkItemButton>
            <NetworkItemButton>Cosmos</NetworkItemButton>
            <NetworkItemButton>cosmos</NetworkItemButton>
            <NetworkItemButton>Cosmos</NetworkItemButton>
            <NetworkItemButton>Cosmos</NetworkItemButton>
            <NetworkItemButton>Cosmos</NetworkItemButton>
            <NetworkItemButton>Cosmos</NetworkItemButton>
          </NetworkListContainer>

          <BetaNetworkContainer>
            <BetaNetworkTitleContainer>
              <Typography variant="h6">Support</Typography>
            </BetaNetworkTitleContainer>
            <BetaNetworkListContainer>
              <NetworkListContainer>
                <NetworkItemButton onClick={() => console.log('select chain')} onClickDelete={() => console.log('delete')}>
                  Axeler
                </NetworkItemButton>
                <NetworkItemButton onClickDelete={() => console.log('delete')}>adadad</NetworkItemButton>
              </NetworkListContainer>
            </BetaNetworkListContainer>
          </BetaNetworkContainer>
        </BodyContainer>
      </Container>
    </Popover>
  );
}
