import { useMemo } from 'react';
import type { PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import { ETHEREUM_CHAINS, ETHEREUM_NETWORKS, TENDERMINT_CHAINS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import Popover from '~/Popup/components/common/Popover';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
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
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { currentEthereumNetwork, setCurrentEthereumNetwork, removeEthereumNetwork } = useCurrentEthereumNetwork();

  const { t } = useTranslation();

  const { allowedChainIds, additionalChains, additionalEthereumNetworks } = chromeStorage;

  const allowedTendermintChain = useMemo(() => TENDERMINT_CHAINS.filter((chain) => allowedChainIds.includes(chain.id)), [allowedChainIds]);
  const allowedEthereumChain = useMemo(() => ETHEREUM_CHAINS.filter((chain) => allowedChainIds.includes(chain.id)), [allowedChainIds]);

  return (
    <Popover {...remainder} onClose={onClose}>
      <Container>
        <HeaderContainer>
          <HeaderLeftContainer>
            <Typography variant="h5">{t('pages.Wallet.components.Header.ChainPopover.index.title')}</Typography>
          </HeaderLeftContainer>
          <HeaderRightContainer>
            <StyledIconButton onClick={() => navigate('/chain/management')}>
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
                    ...ETHEREUM_NETWORKS.map((network) => (
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

          {allowedEthereumChain.length > 0 && allowedTendermintChain.length > 0 && <StyledDivider />}

          {allowedTendermintChain.length > 0 && (
            <>
              <ChainTitleContainer>
                <Typography variant="h6">Cosmos ecosystem</Typography>
              </ChainTitleContainer>
              <ChainListContainer>
                {allowedTendermintChain.map((chain) => (
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
                        await setCurrentChain([...allowedTendermintChain, ...allowedEthereumChain][0]);
                      }
                      const newAdditionalChains = additionalChains.filter((item) => item.id !== chain.id);

                      await setChromeStorage('additionalChains', newAdditionalChains);
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
        </BodyContainer>
      </Container>
    </Popover>
  );
}
