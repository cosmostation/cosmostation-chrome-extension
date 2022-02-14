import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';

import ChainItemButton from './ChainItemButton';
import {
  BetaChainContainer,
  BetaChainListContainer,
  BetaChainTitleContainer,
  BodyContainer,
  ChainListContainer,
  Container,
  EthereumChainListContainer,
  HeaderContainer,
  HeaderLeftContainer,
  HeaderRightContainer,
  StyledIconButton,
  TendermintChainListContainer,
} from './styled';

import SettingIcon from '~/images/icons/Setting.svg';

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
          <TendermintChainListContainer>
            <ChainListContainer>
              <ChainItemButton isActive imgSrc="https://">
                Cosmos
              </ChainItemButton>
              <ChainItemButton>Cosmos</ChainItemButton>
              <ChainItemButton>cosmos</ChainItemButton>
              <ChainItemButton>Cosmos</ChainItemButton>
              <ChainItemButton>Cosmos</ChainItemButton>
              <ChainItemButton>Cosmos</ChainItemButton>
              <ChainItemButton>Cosmos</ChainItemButton>
            </ChainListContainer>
          </TendermintChainListContainer>

          <BetaChainContainer>
            <BetaChainTitleContainer>
              <Typography variant="h6">Support</Typography>
            </BetaChainTitleContainer>
            <BetaChainListContainer>
              <ChainListContainer>
                <ChainItemButton onClick={() => console.log('select chain')} onClickDelete={() => console.log('delete')}>
                  Axeler
                </ChainItemButton>
                <ChainItemButton onClickDelete={() => console.log('delete')}>adadad</ChainItemButton>
              </ChainListContainer>
            </BetaChainListContainer>
          </BetaChainContainer>
        </BodyContainer>
      </Container>
    </Popover>
  );
}
