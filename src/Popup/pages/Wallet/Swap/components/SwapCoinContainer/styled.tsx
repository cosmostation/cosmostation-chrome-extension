import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  padding: '1.6rem 1.6rem 1.5rem',

  background: theme.colors.base02,
  borderRadius: '0.8rem',
}));

export const HeaderContainer = styled('div')({
  height: '2rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const HeaderLeftContainer = styled('div')(({ theme }) => ({
  color: theme.accentColors.purple01,
}));

export const HeaderRightContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const BodyContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  margin: '1.2rem 0 0',
}));

export const SwapAssetContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginBottom: '1.2rem',
});

export const FooterContainer = styled('div')({
  height: '1.8rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const FooterLeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const FooterRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.colors.text02,
}));
