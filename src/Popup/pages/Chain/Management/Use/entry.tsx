import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { APTOS_NETWORKS, COSMOS_CHAINS, ETHEREUM_NETWORKS, SUI_NETWORKS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { SUI } from '~/constants/chain/sui/sui';
import Divider from '~/Popup/components/common/Divider';
import Image from '~/Popup/components/common/Image';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentShownAptosNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownAptosNetworks';
import { useCurrentShownEthereumNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownEthereumNetworks';
import { useCurrentShownSuiNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownSuiNetworks';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { AptosNetwork, Chain, EthereumNetwork, SuiNetwork } from '~/types/chain';

import SubItem from './components/SubItem';
import {
  ChainAccordionContainer,
  Container,
  ItemLeftContainer,
  ItemLeftImageContainer,
  ItemLeftTextContainer,
  NoResultsContainer,
  StyledChainAccordion,
  StyledChainAccordionDetails,
  StyledChainAccordionSummary,
  StyledInput,
  StyledSearch20Icon,
} from './styled';

import NoResults16Icon from '~/images/icons/NoResults16.svg';

export default function Entry() {
  const [search, setSearch] = useState('');
  const [debouncedOpenSearch] = useDebounce(search, 300);
  const [debouncedCloseSearch] = useDebounce(debouncedOpenSearch, 800);

  const { extensionStorage } = useExtensionStorage();
  const { addAllowedChainId, removeAllowedChainId } = useCurrentAllowedChains();
  const { addShownEthereumNetwork, removeShownEthereumNetwork } = useCurrentShownEthereumNetworks();
  const { addShownAptosNetwork, removeShownAptosNetwork } = useCurrentShownAptosNetworks();
  const { addShownSuiNetwork, removeShownSuiNetwork } = useCurrentShownSuiNetworks();
  const [isExpandedEthereum, setIsExpandedEthereum] = useState<boolean>(false);
  const [isExpandedCosmos, setIsExpandedCosmos] = useState<boolean>(false);
  const [isExpandedAptos, setIsExpandedAptos] = useState<boolean>(false);
  const [isExpandedSui, setIsExpandedSui] = useState<boolean>(false);

  const handleChange = (panel: 'ethereum' | 'cosmos' | 'aptos' | 'sui') => (_: React.SyntheticEvent, newExpanded: boolean) => {
    if (panel === 'ethereum') {
      setIsExpandedEthereum(newExpanded);
    } else if (panel === 'cosmos') {
      setIsExpandedCosmos(newExpanded);
    } else if (panel === 'aptos') {
      setIsExpandedAptos(newExpanded);
    } else if (panel === 'sui') {
      setIsExpandedSui(newExpanded);
    }
  };

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { allowedChainIds, shownEthereumNetworkIds, shownAptosNetworkIds, shownSuiNetworkIds } = extensionStorage;

  const filteredEthereumNetworks = useMemo(() => {
    if (debouncedOpenSearch) {
      return ETHEREUM_NETWORKS.filter((network) => network.networkName.toLowerCase().indexOf(debouncedOpenSearch.toLowerCase()) > -1);
    }

    return debouncedCloseSearch
      ? ETHEREUM_NETWORKS.filter((network) => network.networkName.toLowerCase().indexOf(debouncedCloseSearch.toLowerCase()) > -1)
      : ETHEREUM_NETWORKS;
  }, [debouncedCloseSearch, debouncedOpenSearch]);

  const filteredAptosNetworks = useMemo(() => {
    if (debouncedOpenSearch) {
      return APTOS.chainName.toLowerCase().indexOf(debouncedOpenSearch.toLowerCase()) > -1 ? APTOS_NETWORKS : [];
    }

    return debouncedCloseSearch ? (APTOS.chainName.toLowerCase().indexOf(debouncedCloseSearch.toLowerCase()) > -1 ? APTOS_NETWORKS : []) : APTOS_NETWORKS;
  }, [debouncedCloseSearch, debouncedOpenSearch]);

  const filteredSuiNetworks = useMemo(() => {
    if (debouncedOpenSearch) {
      return SUI.chainName.toLowerCase().indexOf(debouncedOpenSearch.toLowerCase()) > -1 ? SUI_NETWORKS : [];
    }

    return debouncedCloseSearch ? (SUI.chainName.toLowerCase().indexOf(debouncedCloseSearch.toLowerCase()) > -1 ? SUI_NETWORKS : []) : SUI_NETWORKS;
  }, [debouncedCloseSearch, debouncedOpenSearch]);

  const filteredCosmosChains = useMemo(() => {
    if (debouncedOpenSearch) {
      return COSMOS_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(debouncedOpenSearch.toLowerCase()) > -1);
    }

    return debouncedCloseSearch
      ? COSMOS_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(debouncedCloseSearch.toLowerCase()) > -1)
      : COSMOS_CHAINS;
  }, [debouncedCloseSearch, debouncedOpenSearch]);

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
      if (shownEthereumNetworkIds.length === 0) {
        await addAllowedChainId(ETHEREUM);
      }
      await addShownEthereumNetwork(network);
    } else if (shownEthereumNetworkIds.length === 1) {
      if (allowedChainIds.length < 2) {
        enqueueSnackbar(t('pages.Chain.Management.Use.entry.removeAllowedChainError'), { variant: 'error' });
      } else {
        await removeShownEthereumNetwork(network);
        await removeAllowedChainId(ETHEREUM);
      }
    } else {
      await removeShownEthereumNetwork(network);
    }
  };

  const handleOnChangeAptosNetwork = async (checked: boolean, network: AptosNetwork) => {
    if (checked) {
      if (shownAptosNetworkIds.length === 0) {
        await addAllowedChainId(APTOS);
      }
      await addShownAptosNetwork(network);
    } else if (shownAptosNetworkIds.length === 1) {
      if (allowedChainIds.length < 2) {
        enqueueSnackbar(t('pages.Chain.Management.Use.entry.removeAllowedChainError'), { variant: 'error' });
      } else {
        await removeShownAptosNetwork(network);
        await removeAllowedChainId(APTOS);
      }
    } else {
      await removeShownAptosNetwork(network);
    }
  };

  const handleOnChangeSuiNetwork = async (checked: boolean, network: SuiNetwork) => {
    if (checked) {
      if (shownSuiNetworkIds.length === 0) {
        await addAllowedChainId(SUI);
      }
      await addShownSuiNetwork(network);
    } else if (shownSuiNetworkIds.length === 1) {
      if (allowedChainIds.length < 2) {
        enqueueSnackbar(t('pages.Chain.Management.Use.entry.removeAllowedChainError'), { variant: 'error' });
      } else {
        await removeShownSuiNetwork(network);
        await removeAllowedChainId(SUI);
      }
    } else {
      await removeShownSuiNetwork(network);
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
        <StyledChainAccordion expanded={!!debouncedOpenSearch || isExpandedEthereum} onChange={handleChange('ethereum')}>
          <StyledChainAccordionSummary
            data-is-expanded={!!debouncedOpenSearch || isExpandedEthereum}
            data-is-exists={!!filteredEthereumNetworks.length}
            aria-controls="ethereum-content"
            id="ethereum-header"
          >
            <ItemLeftContainer>
              <ItemLeftImageContainer>
                <Image src={ETHEREUM.imageURL} />
              </ItemLeftImageContainer>
              <ItemLeftTextContainer>
                <Typography variant="h5">EVM Networks</Typography>
              </ItemLeftTextContainer>
            </ItemLeftContainer>
          </StyledChainAccordionSummary>
          <StyledChainAccordionDetails data-is-exists={!!filteredEthereumNetworks.length}>
            {filteredEthereumNetworks.length ? (
              filteredEthereumNetworks.map((network) => (
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
              ))
            ) : (
              <NoResultsContainer>
                <NoResults16Icon />
                <Typography variant="h6">No Results</Typography>
              </NoResultsContainer>
            )}
          </StyledChainAccordionDetails>
        </StyledChainAccordion>

        <StyledChainAccordion expanded={!!debouncedOpenSearch || isExpandedCosmos} onChange={handleChange('cosmos')}>
          <StyledChainAccordionSummary
            data-is-expanded={!!debouncedOpenSearch || isExpandedCosmos}
            data-is-exists={!!filteredCosmosChains.length}
            aria-controls="cosmos-content"
            id="cosmos-header"
          >
            <ItemLeftContainer>
              <ItemLeftImageContainer>
                <Image src={COSMOS.imageURL} />
              </ItemLeftImageContainer>
              <ItemLeftTextContainer>
                <Typography variant="h5">Cosmos Chains</Typography>
              </ItemLeftTextContainer>
            </ItemLeftContainer>
          </StyledChainAccordionSummary>
          <StyledChainAccordionDetails data-is-exists={!!filteredCosmosChains.length}>
            {filteredCosmosChains.length ? (
              filteredCosmosChains.map((chain) => (
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
              ))
            ) : (
              <NoResultsContainer>
                <NoResults16Icon />
                <Typography variant="h6">No Results</Typography>
              </NoResultsContainer>
            )}
          </StyledChainAccordionDetails>
        </StyledChainAccordion>
        <StyledChainAccordion expanded={!!debouncedOpenSearch || isExpandedAptos} onChange={handleChange('aptos')}>
          <StyledChainAccordionSummary
            data-is-expanded={!!debouncedOpenSearch || isExpandedAptos}
            data-is-exists={!!filteredAptosNetworks.length}
            aria-controls="aptos-content"
            id="aptos-header"
          >
            <ItemLeftContainer>
              <ItemLeftImageContainer>
                <Image src={APTOS.imageURL} />
              </ItemLeftImageContainer>
              <ItemLeftTextContainer>
                <Typography variant="h5">Aptos Networks</Typography>
              </ItemLeftTextContainer>
            </ItemLeftContainer>
          </StyledChainAccordionSummary>
          <StyledChainAccordionDetails data-is-exists={!!filteredAptosNetworks.length}>
            {filteredAptosNetworks.length ? (
              filteredAptosNetworks.map((network) => (
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
              ))
            ) : (
              <NoResultsContainer>
                <NoResults16Icon />
                <Typography variant="h6">No Results</Typography>
              </NoResultsContainer>
            )}
          </StyledChainAccordionDetails>
        </StyledChainAccordion>
        <StyledChainAccordion expanded={!!debouncedOpenSearch || isExpandedSui} onChange={handleChange('sui')}>
          <StyledChainAccordionSummary
            data-is-expanded={!!debouncedOpenSearch || isExpandedSui}
            data-is-exists={!!filteredSuiNetworks.length}
            aria-controls="aptos-content"
            id="aptos-header"
          >
            <ItemLeftContainer>
              <ItemLeftImageContainer>
                <Image src={SUI.imageURL} />
              </ItemLeftImageContainer>
              <ItemLeftTextContainer>
                <Typography variant="h5">Sui Networks</Typography>
              </ItemLeftTextContainer>
            </ItemLeftContainer>
          </StyledChainAccordionSummary>
          <StyledChainAccordionDetails data-is-exists={!!filteredSuiNetworks.length}>
            {filteredSuiNetworks.length ? (
              filteredSuiNetworks.map((network) => (
                <SubItem
                  key={network.id}
                  imageProps={{ alt: network.networkName, src: network.imageURL }}
                  switchProps={{
                    checked: shownSuiNetworkIds.includes(network.id),
                    onChange: (_, checked) => {
                      void handleOnChangeSuiNetwork(checked, network);
                    },
                  }}
                >
                  {network.networkName}
                </SubItem>
              ))
            ) : (
              <NoResultsContainer>
                <NoResults16Icon />
                <Typography variant="h6">No Results</Typography>
              </NoResultsContainer>
            )}
          </StyledChainAccordionDetails>
        </StyledChainAccordion>
        <Divider />
      </ChainAccordionContainer>
    </Container>
  );
}
