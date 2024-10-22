import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { InputAdornment, Typography } from '@mui/material';

import { APTOS_CHAINS, APTOS_NETWORKS, BITCOIN_CHAINS, COSMOS_CHAINS, ETHEREUM_CHAINS, ETHEREUM_NETWORKS, SUI_CHAINS, SUI_NETWORKS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { SUI } from '~/constants/chain/sui/sui';
import Divider from '~/Popup/components/common/Divider';
import Image from '~/Popup/components/common/Image';
import Switch from '~/Popup/components/common/Switch';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentShownAptosNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownAptosNetworks';
import { useCurrentShownEthereumNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownEthereumNetworks';
import { useCurrentShownSuiNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownSuiNetworks';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Chain } from '~/types/chain';

import {
  ChainContainer,
  Container,
  DividerContainer,
  ItemContainer,
  ItemLeftContainer,
  ItemLeftImageContainer,
  ItemLeftTextContainer,
  ItemRightContainer,
  ListContainer,
  StyledInput,
  StyledSearch20Icon,
} from './styled';

export default function SelectChain() {
  const [search, setSearch] = useState('');

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const { addAllowedChainId, removeAllowedChainId } = useCurrentAllowedChains();
  const { addShownEthereumNetworks, removeShownEthereumNetworks } = useCurrentShownEthereumNetworks();
  const { addShownAptosNetworks, removeShownAptosNetworks } = useCurrentShownAptosNetworks();
  const { addShownSuiNetworks, removeShownSuiNetworks } = useCurrentShownSuiNetworks();

  const { extensionStorage } = useExtensionStorage();

  const { allowedChainIds } = extensionStorage;

  const filteredCosmosChains = search ? COSMOS_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1) : COSMOS_CHAINS;
  const filteredEthereumChains = search ? ETHEREUM_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1) : ETHEREUM_CHAINS;
  const filteredAptosChains = search ? APTOS_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1) : APTOS_CHAINS;
  const filteredSuiChains = search ? SUI_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1) : SUI_CHAINS;
  const filteredBitcoinChains = search ? BITCOIN_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1) : BITCOIN_CHAINS;

  const handleOnChange = async (checked: boolean, chain: Chain) => {
    if (checked) {
      await addAllowedChainId(chain);

      if (chain.id === ETHEREUM.id) {
        await addShownEthereumNetworks(ETHEREUM_NETWORKS);
      }

      if (chain.id === APTOS.id) {
        await addShownAptosNetworks(APTOS_NETWORKS);
      }

      if (chain.id === SUI.id) {
        await addShownSuiNetworks(SUI_NETWORKS);
      }
    } else if (allowedChainIds.length < 2) {
      enqueueSnackbar(t('pages.Account.Initialize.components.SelectChain.index.removeAllowedChainError'), { variant: 'error' });
    } else {
      await removeAllowedChainId(chain);

      if (chain.id === ETHEREUM.id) {
        await removeShownEthereumNetworks(ETHEREUM_NETWORKS);
      }

      if (chain.id === APTOS.id) {
        await removeShownAptosNetworks(APTOS_NETWORKS);
      }

      if (chain.id === SUI.id) {
        await removeShownSuiNetworks(SUI_NETWORKS);
      }
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
        placeholder={t('pages.Account.Initialize.components.SelectChain.index.placeholder')}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      <ChainContainer>
        <ListContainer>
          {filteredEthereumChains.map((chain) => (
            <Item
              key={chain.id}
              imageProps={{ alt: chain.chainName, src: chain.imageURL }}
              switchProps={{
                checked: allowedChainIds.includes(chain.id),
                onChange: (_, checked) => {
                  void handleOnChange(checked, chain);
                },
              }}
            >
              {chain.chainName}
            </Item>
          ))}

          {filteredBitcoinChains.map((chain) => (
            <Item
              key={chain.id}
              imageProps={{ alt: chain.chainName, src: chain.imageURL }}
              switchProps={{
                checked: allowedChainIds.includes(chain.id),
                onChange: (_, checked) => {
                  void handleOnChange(checked, chain);
                },
              }}
            >
              {chain.chainName}
            </Item>
          ))}

          {filteredAptosChains.map((chain) => (
            <Item
              key={chain.id}
              imageProps={{ alt: chain.chainName, src: chain.imageURL }}
              switchProps={{
                checked: allowedChainIds.includes(chain.id),
                onChange: (_, checked) => {
                  void handleOnChange(checked, chain);
                },
              }}
            >
              {chain.chainName}
            </Item>
          ))}

          {filteredSuiChains.map((chain) => (
            <Item
              key={chain.id}
              imageProps={{ alt: chain.chainName, src: chain.imageURL }}
              switchProps={{
                checked: allowedChainIds.includes(chain.id),
                onChange: (_, checked) => {
                  void handleOnChange(checked, chain);
                },
              }}
            >
              {chain.chainName}
            </Item>
          ))}
        </ListContainer>

        {filteredCosmosChains.length > 0 && filteredEthereumChains.length > 0 && (
          <DividerContainer>
            <Divider />
          </DividerContainer>
        )}

        <ListContainer>
          {filteredCosmosChains.map((chain) => (
            <Item
              key={chain.id}
              imageProps={{ alt: chain.chainName, src: chain.imageURL }}
              switchProps={{
                checked: allowedChainIds.includes(chain.id),
                onChange: (_, checked) => {
                  void handleOnChange(checked, chain);
                },
              }}
            >
              {chain.chainName}
            </Item>
          ))}
        </ListContainer>
      </ChainContainer>
    </Container>
  );
}

type ItemProps = {
  imageProps?: React.ComponentProps<typeof Image>;
  switchProps?: React.ComponentProps<typeof Switch>;
  children?: string;
};

function Item({ children, imageProps, switchProps }: ItemProps) {
  return (
    <ItemContainer>
      <ItemLeftContainer>
        <ItemLeftImageContainer>
          <Image {...imageProps} />
        </ItemLeftImageContainer>
        <ItemLeftTextContainer>
          <Typography variant="h5">{children}</Typography>
        </ItemLeftTextContainer>
      </ItemLeftContainer>
      <ItemRightContainer>
        <Switch {...switchProps} />
      </ItemRightContainer>
    </ItemContainer>
  );
}
