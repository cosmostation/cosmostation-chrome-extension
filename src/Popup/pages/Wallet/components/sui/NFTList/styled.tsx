import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  paddingBottom: '0.9rem',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const ListTitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'space-between',

  flexShrink: 0,
});

export const ListTitleLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'flex-start',
});

export const ListTitleRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'flex-end',
});

export const ListContainer = styled('div')({
  marginTop: '0.9rem',

  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16.4rem, 1fr))',

  // NOTE need 0.8rem
  gridColumnGap: '0.7rem',
  gridRowGap: '0.8rem',

  overflow: 'auto',
});

export const NoNFTContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  marginTop: '6.8rem',

  rowGap: '0.8rem',
});

export const NoNFTTextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  rowGap: '0.4rem',
});

export const NoNFTHeaderTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const NoNFTSubTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));
