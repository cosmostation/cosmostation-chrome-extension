import { useMemo } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import { APTOS_CHAINS, COSMOS_CHAINS, ETHEREUM_CHAINS, SUI_CHAINS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentShownAptosNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownAptosNetworks';
import { useCurrentShownEthereumNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownEthereumNetworks';
import { useCurrentShownSuiNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownSuiNetworks';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Chain } from '~/types/chain';

import ChainItemButton from './ChainItemButton';
import {
  BodyContainer,
  ChainListContainer,
  ChainTitleContainer,
  Container,
  HeaderContainer,
  HeaderLeftContainer,
  HeaderRightContainer,
  StyledDivider,
  StyledIconButton,
} from './styled';

import SettingIcon24 from '~/images/icons/Setting24.svg';

type ChainPopoverProps = Omit<PopoverProps, 'children'> & {
  currentChain: Chain;
  onClickChain?: (chain: Chain, isCustom?: boolean) => void;
  isOnlyChain?: boolean;
};

export default function ChainPopover({ onClose, currentChain, onClickChain, isOnlyChain = false, ...remainder }: ChainPopoverProps) {
  const { navigate } = useNavigate();
  const { setCurrentChain } = useCurrentChain();
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { currentEthereumNetwork, setCurrentEthereumNetwork, removeEthereumNetwork } = useCurrentEthereumNetwork();
  const { currentShownEthereumNetwork } = useCurrentShownEthereumNetworks();

  const { currentAptosNetwork, setCurrentAptosNetwork, removeAptosNetwork } = useCurrentAptosNetwork();
  const { currentShownAptosNetwork } = useCurrentShownAptosNetworks();

  const { currentSuiNetwork, setCurrentSuiNetwork, removeSuiNetwork } = useCurrentSuiNetwork();
  const { currentShownSuiNetwork } = useCurrentShownSuiNetworks();

  const { t } = useTranslation();

  const { allowedChainIds, additionalChains, additionalEthereumNetworks, additionalAptosNetworks, additionalSuiNetworks } = extensionStorage;

  const allowedCosmosChain = useMemo(() => COSMOS_CHAINS.filter((chain) => allowedChainIds.includes(chain.id)), [allowedChainIds]);
  const allowedEthereumChain = useMemo(() => ETHEREUM_CHAINS.filter((chain) => allowedChainIds.includes(chain.id)), [allowedChainIds]);
  const allowedAptosChain = useMemo(() => APTOS_CHAINS.filter((chain) => allowedChainIds.includes(chain.id)), [allowedChainIds]);
  const allowedSuiChain = useMemo(() => SUI_CHAINS.filter((chain) => allowedChainIds.includes(chain.id)), [allowedChainIds]);

  return (
    <Popover {...remainder} onClose={onClose}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">{t('pages.Wallet.components.Header.ChainPopover.index.title')}</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <StyledIconButton onClick={() => navigate('/chain/management/use')}>
              <SettingIcon24 />
            </StyledIconButton>
          </HeaderRightContainer>
        </HeaderContainer>
        <Divider />
        <BodyContainer>
          {allowedEthereumChain.length > 0 && (
            <>
              <ChainTitleContainer>
                <Typography variant="h6">EVM networks</Typography>
              </ChainTitleContainer>
              <ChainListContainer>
                {allowedEthereumChain.map((chain) => {
                  if (isOnlyChain) {
                    return (
                      <ChainItemButton
                        key={chain.id}
                        isActive={currentChain.id === chain.id}
                        imgSrc={chain.imageURL}
                        onClick={() => {
                          onClickChain?.(chain);
                          onClose?.({}, 'backdropClick');
                        }}
                      >
                        {chain.chainName}
                      </ChainItemButton>
                    );
                  }
                  return [
                    ...currentShownEthereumNetwork.map((network) => (
                      <ChainItemButton
                        key={`${chain.id}-${network.id}`}
                        isActive={currentChain.id === chain.id && currentEthereumNetwork.id === network.id}
                        isBackgroundActive={currentEthereumNetwork.id === network.id}
                        imgSrc={network.imageURL}
                        onClick={async () => {
                          await setCurrentEthereumNetwork(network);
                          onClickChain?.(chain);
                          onClose?.({}, 'backdropClick');
                        }}
                      >
                        {network.networkName}
                      </ChainItemButton>
                    )),
                    ...additionalEthereumNetworks.map((network) => (
                      <ChainItemButton
                        key={`${chain.id}-${network.id}`}
                        isActive={currentChain.id === chain.id && currentEthereumNetwork.id === network.id}
                        isBackgroundActive={currentEthereumNetwork.id === network.id}
                        imgSrc={network.imageURL}
                        onClick={async () => {
                          await setCurrentEthereumNetwork(network);
                          onClickChain?.(chain, true);
                          onClose?.({}, 'backdropClick');
                        }}
                        onClickDelete={async () => {
                          await removeEthereumNetwork(network);
                        }}
                        isCustom
                      >
                        {network.networkName}
                      </ChainItemButton>
                    )),
                  ];
                })}
              </ChainListContainer>
            </>
          )}

          {allowedCosmosChain.length > 0 && (
            <>
              {allowedEthereumChain.length > 0 && <StyledDivider />}
              <ChainTitleContainer>
                <Typography variant="h6">Cosmos chains</Typography>
              </ChainTitleContainer>
              <ChainListContainer>
                {allowedCosmosChain.map((chain) => (
                  <ChainItemButton
                    key={chain.id}
                    isActive={currentChain.id === chain.id}
                    imgSrc={chain.imageURL}
                    onClick={() => {
                      onClickChain?.(chain);
                      onClose?.({}, 'backdropClick');
                    }}
                  >
                    {chain.chainName}
                  </ChainItemButton>
                ))}
                {additionalChains.map((chain) => (
                  <ChainItemButton
                    key={chain.id}
                    isActive={currentChain.id === chain.id}
                    onClick={() => {
                      onClickChain?.(chain, true);
                      onClose?.({}, 'backdropClick');
                    }}
                    onClickDelete={async () => {
                      if (currentChain.id === chain.id) {
                        await setCurrentChain([...allowedCosmosChain, ...allowedEthereumChain][0]);
                      }
                      const newAdditionalChains = additionalChains.filter((item) => item.id !== chain.id);

                      await setExtensionStorage('additionalChains', newAdditionalChains);
                    }}
                    imgSrc={chain.imageURL}
                    isCustom
                  >
                    {chain.chainName}
                  </ChainItemButton>
                ))}
              </ChainListContainer>
            </>
          )}

          {allowedAptosChain.length > 0 && (
            <>
              {[...allowedEthereumChain, ...allowedCosmosChain].length > 0 && <StyledDivider />}
              <ChainTitleContainer>
                <Typography variant="h6">APTOS networks</Typography>
              </ChainTitleContainer>
              <ChainListContainer>
                {allowedAptosChain.map((chain) => {
                  if (isOnlyChain) {
                    return (
                      <ChainItemButton
                        key={chain.id}
                        isActive={currentChain.id === chain.id}
                        imgSrc={chain.imageURL}
                        onClick={() => {
                          onClickChain?.(chain);
                          onClose?.({}, 'backdropClick');
                        }}
                      >
                        {chain.chainName}
                      </ChainItemButton>
                    );
                  }
                  return [
                    ...currentShownAptosNetwork.map((network) => (
                      <ChainItemButton
                        key={`${chain.id}-${network.id}`}
                        isActive={currentChain.id === chain.id && currentAptosNetwork.id === network.id}
                        isBackgroundActive={currentAptosNetwork.id === network.id}
                        imgSrc={network.imageURL}
                        onClick={async () => {
                          await setCurrentAptosNetwork(network);
                          onClickChain?.(chain);
                          onClose?.({}, 'backdropClick');
                        }}
                      >
                        {network.networkName}
                      </ChainItemButton>
                    )),
                    ...additionalAptosNetworks.map((network) => (
                      <ChainItemButton
                        key={`${chain.id}-${network.id}`}
                        isActive={currentChain.id === chain.id && currentAptosNetwork.id === network.id}
                        isBackgroundActive={currentAptosNetwork.id === network.id}
                        imgSrc={network.imageURL}
                        onClick={async () => {
                          await setCurrentAptosNetwork(network);
                          onClickChain?.(chain, true);
                          onClose?.({}, 'backdropClick');
                        }}
                        onClickDelete={async () => {
                          await removeAptosNetwork(network);
                        }}
                        isCustom
                      >
                        {network.networkName}
                      </ChainItemButton>
                    )),
                  ];
                })}
              </ChainListContainer>
            </>
          )}

          {allowedSuiChain.length > 0 && (
            <>
              {[...allowedEthereumChain, ...allowedCosmosChain, ...allowedAptosChain].length > 0 && <StyledDivider />}
              <ChainTitleContainer>
                <Typography variant="h6">SUI networks</Typography>
              </ChainTitleContainer>
              <ChainListContainer>
                {allowedSuiChain.map((chain) => {
                  if (isOnlyChain) {
                    return (
                      <ChainItemButton
                        key={chain.id}
                        isActive={currentChain.id === chain.id}
                        imgSrc={chain.imageURL}
                        onClick={() => {
                          onClickChain?.(chain);
                          onClose?.({}, 'backdropClick');
                        }}
                      >
                        {chain.chainName}
                      </ChainItemButton>
                    );
                  }
                  return [
                    ...currentShownSuiNetwork.map((network) => (
                      <ChainItemButton
                        key={`${chain.id}-${network.id}`}
                        isActive={currentChain.id === chain.id && currentSuiNetwork.id === network.id}
                        isBackgroundActive={currentSuiNetwork.id === network.id}
                        imgSrc={network.imageURL}
                        onClick={async () => {
                          await setCurrentSuiNetwork(network);
                          onClickChain?.(chain);
                          onClose?.({}, 'backdropClick');
                        }}
                      >
                        {network.networkName}
                      </ChainItemButton>
                    )),
                    ...additionalSuiNetworks.map((network) => (
                      <ChainItemButton
                        key={`${chain.id}-${network.id}`}
                        isActive={currentChain.id === chain.id && currentSuiNetwork.id === network.id}
                        isBackgroundActive={currentSuiNetwork.id === network.id}
                        imgSrc={network.imageURL}
                        onClick={async () => {
                          await setCurrentSuiNetwork(network);
                          onClickChain?.(chain, true);
                          onClose?.({}, 'backdropClick');
                        }}
                        onClickDelete={async () => {
                          await removeSuiNetwork(network);
                        }}
                        isCustom
                      >
                        {network.networkName}
                      </ChainItemButton>
                    )),
                  ];
                })}
              </ChainListContainer>
            </>
          )}
        </BodyContainer>
      </Container>
    </Popover>
  );
}
