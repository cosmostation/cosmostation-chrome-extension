import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { InputAdornment, Typography } from '@mui/material';

import { APTOS_CHAINS, APTOS_NETWORKS, COSMOS_CHAINS, ETHEREUM_CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import Image from '~/Popup/components/common/Image';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentShownAptosNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownAptosNetworks';
import { useCurrentShownEthereumNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownEthereumNetworks';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { AptosNetwork, Chain, EthereumNetwork } from '~/types/chain';

import SubItem from './components/SubItem';
import {
  ChainAccordionContainer,
  Container,
  ItemLeftContainer,
  ItemLeftImageContainer,
  ItemLeftTextContainer,
  StyledChainAccordion,
  StyledChainAccordionDetails,
  StyledChainAccordionSummary,
  StyledInput,
  StyledSearch20Icon,
} from './styled';

export default function Entry() {
  const [search, setSearch] = useState('');

  const { chromeStorage } = useChromeStorage();
  const { addAllowedChainId, removeAllowedChainId } = useCurrentAllowedChains();
  const { addShownEthereumNetwork, removeShownEthereumNetwork } = useCurrentShownEthereumNetworks();
  const { addShownAptosNetwork, removeShownAptosNetwork } = useCurrentShownAptosNetworks();
  const [expanded, setExpanded] = React.useState<string | false>();

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { allowedChainIds, shownEthereumNetworkIds, shownAptosNetworkIds } = chromeStorage;

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
    }
  };

  const handleOnChangeEthereumNetwork = async (checked: boolean, network: EthereumNetwork) => {
    if (checked) {
      await addShownEthereumNetwork(network);
      if (shownEthereumNetworkIds.length < 2) {
        filteredEthereumChains.map(async (item) => {
          await addAllowedChainId(item);
        });
      }
    } else if (shownEthereumNetworkIds.length < 2) {
      if (allowedChainIds.length < 2) {
        enqueueSnackbar(t('pages.Chain.Management.Use.entry.removeAllowedChainError'), { variant: 'error' });
      } else {
        filteredEthereumChains.map(async (item) => {
          await removeAllowedChainId(item);
        });
        await removeShownEthereumNetwork(network);
      }
    } else {
      await removeShownEthereumNetwork(network);
    }
  };
  const handleOnChangeAptosNetwork = async (checked: boolean, network: AptosNetwork) => {
    if (checked) {
      await addShownAptosNetwork(network);
      if (shownAptosNetworkIds.length < 2) {
        filteredAptosChains.map(async (item) => {
          await addAllowedChainId(item);
        });
      }
      // TODO 번역어 삭제하기
    } else if (shownAptosNetworkIds.length < 2) {
      if (allowedChainIds.length < 2) {
        enqueueSnackbar(t('pages.Chain.Management.Use.entry.removeAllowedChainError'), { variant: 'error' });
      } else {
        filteredAptosChains.map(async (item) => {
          await removeAllowedChainId(item);
        });
        await removeShownAptosNetwork(network);
      }
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
      <ChainAccordionContainer>
        <StyledChainAccordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <StyledChainAccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <ItemLeftContainer>
              <ItemLeftImageContainer>
                <Image src={ETHEREUM.imageURL} />
              </ItemLeftImageContainer>
              <ItemLeftTextContainer>
                <Typography variant="h5">EVM Networks</Typography>
              </ItemLeftTextContainer>
            </ItemLeftContainer>
          </StyledChainAccordionSummary>
          <StyledChainAccordionDetails>
            {filteredEthereumNetworks.map((network) => (
              <SubItem
                key={network.id}
                imageProps={{ alt: network.networkName, src: network.imageURL }}
                switchProps={{
                  checked: shownEthereumNetworkIds.includes(network.id),
                  onChange: (_, checked) => {
                    void handleOnChangeEthereumNetwork(checked, network);
                  },
                }}
              >
                {network.networkName}
              </SubItem>
            ))}
          </StyledChainAccordionDetails>
        </StyledChainAccordion>
        <StyledChainAccordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <StyledChainAccordionSummary aria-controls="panel2d-content" id="panel2d-header">
            <ItemLeftContainer>
              <ItemLeftImageContainer>
                <Image src={COSMOS.imageURL} />
              </ItemLeftImageContainer>
              <ItemLeftTextContainer>
                <Typography variant="h5">Cosmos Chains</Typography>
              </ItemLeftTextContainer>
            </ItemLeftContainer>
          </StyledChainAccordionSummary>
          <StyledChainAccordionDetails>
            {filteredCosmosChains.map((chain) => (
              <SubItem
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
              </SubItem>
            ))}
          </StyledChainAccordionDetails>
        </StyledChainAccordion>
        <StyledChainAccordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <StyledChainAccordionSummary aria-controls="panel3d-content" id="panel3d-header">
            <ItemLeftContainer>
              <ItemLeftImageContainer>
                <Image src={APTOS.imageURL} />
              </ItemLeftImageContainer>
              <ItemLeftTextContainer>
                <Typography variant="h5">Aptos Networks</Typography>
              </ItemLeftTextContainer>
            </ItemLeftContainer>
          </StyledChainAccordionSummary>
          <StyledChainAccordionDetails>
            {filteredAptosNetworks.map((network) => (
              <SubItem
                key={network.id}
                imageProps={{ alt: network.networkName, src: network.imageURL }}
                switchProps={{
                  checked: shownAptosNetworkIds.includes(network.id),
                  onChange: (_, checked) => {
                    void handleOnChangeAptosNetwork(checked, network);
                  },
                }}
              >
                {network.networkName}
              </SubItem>
            ))}
          </StyledChainAccordionDetails>
        </StyledChainAccordion>
      </ChainAccordionContainer>
    </Container>
  );
}
