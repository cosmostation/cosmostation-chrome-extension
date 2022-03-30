import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  width: '18rem',
  maxHeight: '49.7rem',
  overflow: 'auto',

  color: theme.colors.text01,
}));

export const HeaderContainer = styled('div')({
  height: '4.2rem',
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '0 1.6rem',
});

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

export const BodyContainer = styled('div')({
  padding: '1.6rem',
});

export const NetworkListContainer = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.4rem',
});

export const BetaNetworkContainer = styled('div')({
  marginTop: '2.2rem',
  width: '100%',
});

export const BetaNetworkTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const BetaNetworkListContainer = styled('div')({
  marginTop: '0.8rem',
});
