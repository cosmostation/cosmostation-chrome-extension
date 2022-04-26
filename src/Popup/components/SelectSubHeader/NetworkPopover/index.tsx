import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
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
} from './styled';

type NetworkPopoverProps = Omit<PopoverProps, 'children'>;

export default function NetworkPopover({ onClose, ...remainder }: NetworkPopoverProps) {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { currentNetwork, setCurrentNetwork } = useCurrentNetwork();

  const { t } = useTranslation();

  const { additionalEthereumNetworks } = chromeStorage;

  return (
    <Popover {...remainder} onClose={onClose}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">{t('pages.Wallet.components.Header.NetworkPopover.index.title')}</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer />
        </HeaderContainer>
        <Divider />
        <BodyContainer>
          <NetworkListContainer>
            {ETHEREUM_NETWORKS.map((network) => (
              <NetworkItemButton
                key={network.id}
                onClick={async () => {
                  await setCurrentNetwork(network);
                  onClose?.({}, 'backdropClick');
                }}
                isActive={network.id === currentNetwork.id}
                imgSrc={network.imageURL}
              >
                {network.networkName}
              </NetworkItemButton>
            ))}
          </NetworkListContainer>

          {additionalEthereumNetworks.length > 0 && (
            <BetaNetworkContainer>
              <BetaNetworkTitleContainer>
                <Typography variant="h6">{t('pages.Wallet.components.Header.NetworkPopover.index.customNetwork')}</Typography>
              </BetaNetworkTitleContainer>
              <BetaNetworkListContainer>
                <NetworkListContainer>
                  {additionalEthereumNetworks.map((network) => (
                    <NetworkItemButton
                      key={network.id}
                      onClickDelete={async () => {
                        if (network.id === currentNetwork.id) {
                          await setCurrentNetwork(ETHEREUM_NETWORKS[0]);
                        }

                        const currentAdditionalEthereumNetworks = chromeStorage.additionalEthereumNetworks;

                        const newAdditionalEthereumNetworks = currentAdditionalEthereumNetworks.filter((item) => item.id !== network.id);

                        await setChromeStorage('additionalEthereumNetworks', newAdditionalEthereumNetworks);
                      }}
                      onClick={async () => {
                        await setCurrentNetwork(network);
                        onClose?.({}, 'backdropClick');
                      }}
                      isActive={network.id === currentNetwork.id}
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
