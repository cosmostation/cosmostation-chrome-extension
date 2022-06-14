import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

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
  StyledIconButton,
} from './styled';

import Plus24Icon from '~/images/icons/Plus24.svg';

type NetworkPopoverProps = Omit<PopoverProps, 'children'>;

export default function NetworkPopover({ onClose, ...remainder }: NetworkPopoverProps) {
  const { currentEthereumNetwork, setCurrentEthereumNetwork, removeEthereumNetwork, ethereumNetworks } = useCurrentEthereumNetwork();

  const { navigate } = useNavigate();
  const { t } = useTranslation();

  return (
    <Popover {...remainder} onClose={onClose}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">{t('pages.Wallet.components.Header.NetworkPopover.index.title')}</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <StyledIconButton onClick={() => navigate('/chain/ethereum/network/add')}>
              <Plus24Icon />
            </StyledIconButton>
          </HeaderRightContainer>
        </HeaderContainer>
        <Divider />
        <BodyContainer>
          <NetworkListContainer>
            {ETHEREUM_NETWORKS.map((network) => (
              <NetworkItemButton
                key={network.id}
                onClick={async () => {
                  await setCurrentEthereumNetwork(network);
                  onClose?.({}, 'backdropClick');
                }}
                isActive={network.id === currentEthereumNetwork.id}
                imgSrc={network.imageURL}
              >
                {network.networkName}
              </NetworkItemButton>
            ))}
          </NetworkListContainer>

          {ethereumNetworks.length > 0 && (
            <BetaNetworkContainer>
              <BetaNetworkTitleContainer>
                <Typography variant="h6">{t('pages.Wallet.components.Header.NetworkPopover.index.customNetwork')}</Typography>
              </BetaNetworkTitleContainer>
              <BetaNetworkListContainer>
                <NetworkListContainer>
                  {ethereumNetworks.map((network) => (
                    <NetworkItemButton
                      key={network.id}
                      onClickDelete={async () => {
                        await removeEthereumNetwork(network);
                      }}
                      onClick={async () => {
                        await setCurrentEthereumNetwork(network);
                        onClose?.({}, 'backdropClick');
                      }}
                      isActive={network.id === currentEthereumNetwork.id}
                      imgSrc={network.imageURL}
                    >
                      {network.networkName}
                    </NetworkItemButton>
                  ))}
                </NetworkListContainer>
              </BetaNetworkListContainer>
            </BetaNetworkContainer>
          )}
        </BodyContainer>
      </Container>
    </Popover>
  );
}
