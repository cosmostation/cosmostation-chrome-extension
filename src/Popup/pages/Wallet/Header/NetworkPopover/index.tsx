import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';

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

type NetworkPopoverProps = Pick<PopoverProps, 'onClose'>;

export default function NetworkPopover({ onClose }: NetworkPopoverProps) {
  const { chromeStorage } = useChromeStorage();
  const { currentNetwork } = useCurrentNetwork();

  const { additionalEthereumNetworks } = chromeStorage;

  return (
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
          {ETHEREUM_NETWORKS.map((network) => (
            <NetworkItemButton key={network.id} isActive={network.id === currentNetwork.id} imgSrc={network.imageURL}>
              {network.networkName}
            </NetworkItemButton>
          ))}
        </NetworkListContainer>

        {additionalEthereumNetworks.length > 0 && (
          <BetaNetworkContainer>
            <BetaNetworkTitleContainer>
              <Typography variant="h6">Support</Typography>
            </BetaNetworkTitleContainer>
            <BetaNetworkListContainer>
              <NetworkListContainer>
                {additionalEthereumNetworks.map((network) => (
                  <NetworkItemButton key={network.id} onClickDelete={() => null} isActive={network.id === currentNetwork.id} imgSrc={network.imageURL}>
                    {network.networkName}
                  </NetworkItemButton>
                ))}
              </NetworkListContainer>
            </BetaNetworkListContainer>
          </BetaNetworkContainer>
        )}
      </BodyContainer>
    </Container>
  );
}
