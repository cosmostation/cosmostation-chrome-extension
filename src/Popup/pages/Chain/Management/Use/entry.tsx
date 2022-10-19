import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { InputAdornment } from '@mui/material';

import { APTOS_CHAINS, APTOS_NETWORKS, COSMOS_CHAINS, ETHEREUM_CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import Divider from '~/Popup/components/common/Divider';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentShownAptosNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownAptosNetworks';
import { useCurrentShownEthereumNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownEthereumNetworks';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { AptosNetwork, Chain, EthereumNetwork } from '~/types/chain';

import Item from './components/Item';
import SubItem from './components/SubItem';
import { Container, DividerContainer, ListContainer, StyledInput, StyledSearch20Icon } from './styled';

export default function Entry() {
  const [search, setSearch] = useState('');

  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { addAllowedChainId, removeAllowedChainId } = useCurrentAllowedChains();
  const { addShownEthereumNetwork, removeShownEthereumNetwork } = useCurrentShownEthereumNetworks();
  const { addShownAptosNetwork, removeShownAptosNetwork } = useCurrentShownAptosNetworks();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { allowedChainIds, shownEthereumNetworkIds, shownAptosNetworkIds, autoSigns } = chromeStorage;

  const filteredEthereumNetworks = search
    ? ETHEREUM_NETWORKS.filter((network) => network.networkName.toLowerCase().indexOf(search.toLowerCase()) > -1)
    : ETHEREUM_NETWORKS;

  const filteredAptosNetworks = search
    ? APTOS_NETWORKS.filter((network) => network.networkName.toLowerCase().indexOf(search.toLowerCase()) > -1)
    : APTOS_NETWORKS;

  const filteredCosmosChains = search ? COSMOS_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1) : COSMOS_CHAINS;
  const filteredEthereumChains =
    filteredEthereumNetworks.length === 0 && search
      ? ETHEREUM_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1)
      : ETHEREUM_CHAINS;

  const filteredAptosChains =
    filteredAptosNetworks.length === 0 && search
      ? APTOS_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1)
      : APTOS_CHAINS;

  const handleOnChangeChain = async (checked: boolean, chain: Chain) => {
    if (checked) {
      await addAllowedChainId(chain);
    } else if (allowedChainIds.length < 2) {
      enqueueSnackbar(t('pages.Chain.Management.Use.entry.removeAllowedChainError'), { variant: 'error' });
    } else {
      await removeAllowedChainId(chain);

      const newAutoSigns = autoSigns.filter((autoSign) => autoSign.chainId !== chain.id);
      await setChromeStorage('autoSigns', newAutoSigns);
    }
  };

  const handleOnChangeEthereumNetwork = async (checked: boolean, network: EthereumNetwork) => {
    if (checked) {
      await addShownEthereumNetwork(network);
    } else if (shownEthereumNetworkIds.length < 2) {
      enqueueSnackbar(t('pages.Chain.Management.Use.entry.removeShownEthereumNetworkError'), { variant: 'error' });
    } else {
      await removeShownEthereumNetwork(network);
    }
  };

  const handleOnChangeAptosNetwork = async (checked: boolean, network: AptosNetwork) => {
    if (checked) {
      await addShownAptosNetwork(network);
    } else if (shownAptosNetworkIds.length < 2) {
      enqueueSnackbar(t('pages.Chain.Management.Use.entry.removeShownAptosNetworkError'), { variant: 'error' });
    } else {
      await removeShownAptosNetwork(network);
    }
  };

  return (
    <Container>
      <StyledInput
        startAdornment={
          <InputAdornment position="start">
            <StyledSearch20Icon />
          </InputAdornment>
        }
        placeholder={t('pages.Chain.Management.Use.entry.searchPlaceholder')}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      <ListContainer>
        {filteredEthereumChains.map((chain) => (
          <Item
            key={chain.id}
            imageProps={{ alt: chain.chainName, src: chain.imageURL }}
            switchProps={{
              checked: allowedChainIds.includes(chain.id),
              onChange: (_, checked) => {
                void handleOnChangeChain(checked, chain);
              },
            }}
          >
            {chain.chainName}
          </Item>
        ))}
        {filteredEthereumNetworks.map((network) => (
          <SubItem
            key={network.id}
            imageProps={{ alt: network.networkName, src: network.imageURL }}
            switchProps={{
              checked: shownEthereumNetworkIds.includes(network.id),
              onChange: (_, checked) => {
                void handleOnChangeEthereumNetwork(checked, network);
              },
              disabled: !allowedChainIds.includes(ETHEREUM.id),
            }}
          >
            {network.networkName}
          </SubItem>
        ))}

        <>
          {filteredEthereumChains.length > 0 && (
            <DividerContainer>
              <Divider />
            </DividerContainer>
          )}
          {filteredCosmosChains.map((chain) => (
            <Item
              key={chain.id}
              imageProps={{ alt: chain.chainName, src: chain.imageURL }}
              switchProps={{
                checked: allowedChainIds.includes(chain.id),
                onChange: (_, checked) => {
                  void handleOnChangeChain(checked, chain);
                },
              }}
            >
              {chain.chainName}
            </Item>
          ))}
        </>
        <>
          {[...filteredEthereumChains, ...filteredCosmosChains].length > 0 && (
            <DividerContainer>
              <Divider />
            </DividerContainer>
          )}
          {filteredAptosChains.map((chain) => (
            <Item
              key={chain.id}
              imageProps={{ alt: chain.chainName, src: chain.imageURL }}
              switchProps={{
                checked: allowedChainIds.includes(chain.id),
                onChange: (_, checked) => {
                  void handleOnChangeChain(checked, chain);
                },
              }}
            >
              {chain.chainName}
            </Item>
          ))}
          {filteredAptosNetworks.map((network) => (
            <SubItem
              key={network.id}
              imageProps={{ alt: network.networkName, src: network.imageURL }}
              switchProps={{
                checked: shownAptosNetworkIds.includes(network.id),
                onChange: (_, checked) => {
                  void handleOnChangeAptosNetwork(checked, network);
                },
                disabled: !allowedChainIds.includes(ETHEREUM.id),
              }}
            >
              {network.networkName}
            </SubItem>
          ))}
        </>
      </ListContainer>
    </Container>
  );
}
