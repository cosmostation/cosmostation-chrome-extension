import { useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { ETHEREUM_CHAINS, TENDERMINT_CHAINS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import Image from '~/Popup/components/common/Image';
import Switch from '~/Popup/components/common/Switch';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { upperCaseFirst } from '~/Popup/utils/common';

import {
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

export default function Entry() {
  const [search, setSearch] = useState('');

  const { addAllowedChainId, removeAllowedChainId, chromeStorage } = useChromeStorage();

  const { currentAccount } = useCurrentAccount();

  const { allowedChainIds } = chromeStorage;

  const filteredTendermintChains = search
    ? TENDERMINT_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1)
    : TENDERMINT_CHAINS;
  const filteredEthereumChains = search ? ETHEREUM_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1) : ETHEREUM_CHAINS;

  return (
    <Container>
      <StyledInput
        startAdornment={
          <InputAdornment position="start">
            <StyledSearch20Icon />
          </InputAdornment>
        }
        placeholder="Search chain"
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      <ListContainer>
        {filteredTendermintChains.map((chain) => (
          <Item
            key={chain.id}
            imageProps={{ alt: chain.chainName, src: chain.imageURL }}
            switchProps={{
              checked: allowedChainIds.includes(chain.id),
              onChange: async (_, checked) => {
                if (checked) {
                  await addAllowedChainId(chain.id);
                } else {
                  await removeAllowedChainId(chain.id);
                }
              },
            }}
          >
            {chain.chainName}
          </Item>
        ))}
        {filteredTendermintChains.length > 0 && filteredEthereumChains.length > 0 && (
          <DividerContainer>
            <Divider />
          </DividerContainer>
        )}
        {filteredEthereumChains.map((chain) => (
          <Item
            key={chain.id}
            imageProps={{ alt: chain.chainName, src: chain.imageURL }}
            switchProps={{
              checked: allowedChainIds.includes(chain.id),
              onChange: async (_, checked) => {
                if (checked) {
                  await addAllowedChainId(chain.id);
                } else {
                  await removeAllowedChainId(chain.id);
                }
              },
            }}
          >
            {chain.chainName}
          </Item>
        ))}
      </ListContainer>
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
          <Typography variant="h5">{upperCaseFirst(children)}</Typography>
        </ItemLeftTextContainer>
      </ItemLeftContainer>
      <ItemRightContainer>
        <Switch {...switchProps} />
      </ItemRightContainer>
    </ItemContainer>
  );
}
