import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')(({ theme }) => ({
  width: '18rem',
  maxHeight: '49.7rem',
  overflow: 'auto',

  color: theme.colors.text01,
}));

export const HeaderContainer = styled('div')(({ theme }) => ({
  height: '4.2rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '0 1.6rem',

  width: 'calc(100% - 3.2rem)',
}));

export const HeaderLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const HeaderRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const BodyContainer = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  padding: '1.6rem',
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: '-1.2rem',

  '& svg': {
    fill: theme.colors.base05,
  },
}));

export const ChainListContainer = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.4rem',
});

export const TendermintChainListContainer = styled('div')({
  marginBottom: '1.2rem',
});
export const EthereumChainListContainer = styled('div')({
  marginTop: '1.2rem',
});

export const BetaChainContainer = styled('div')({
  marginTop: '2.4rem',
  width: '100%',
});

export const BetaChainTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const BetaChainListContainer = styled('div')({
  marginTop: '0.8rem',
});
