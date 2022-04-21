import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { InputAdornment, Typography } from '@mui/material';

import { ETHEREUM_CHAINS, TENDERMINT_CHAINS } from '~/constants/chain';
import Divider from '~/Popup/components/common/Divider';
import Image from '~/Popup/components/common/Image';
import Switch from '~/Popup/components/common/Switch';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Chain } from '~/types/chain';

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

  const { chromeStorage } = useChromeStorage();
  const { addAllowedChainId, removeAllowedChainId } = useCurrentAllowedChains();

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { allowedChainIds } = chromeStorage;

  const filteredTendermintChains = search
    ? TENDERMINT_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1)
    : TENDERMINT_CHAINS;
  const filteredEthereumChains = search ? ETHEREUM_CHAINS.filter((chain) => chain.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1) : ETHEREUM_CHAINS;

  const handleOnChange = async (checked: boolean, chain: Chain) => {
    if (checked) {
      await addAllowedChainId(chain.id);
    } else if (allowedChainIds.length < 2) {
      enqueueSnackbar(t('pages.Chain.Management.Use.entry.removeAllowedChainError'), { variant: 'error' });
    } else {
      await removeAllowedChainId(chain.id);
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
        {filteredTendermintChains.map((chain) => (
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
              onChange: (_, checked) => {
                void handleOnChange(checked, chain);
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
          <Typography variant="h5">{children}</Typography>
        </ItemLeftTextContainer>
      </ItemLeftContainer>
      <ItemRightContainer>
        <Switch {...switchProps} />
      </ItemRightContainer>
    </ItemContainer>
  );
}
