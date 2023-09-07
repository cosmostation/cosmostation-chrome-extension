import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  height: '30rem',

  display: 'flex',
  paddingBottom: '1.6rem',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const ListContainer = styled('div')({
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',

  rowGap: '0.8rem',

  overflow: 'auto',
});

export const EmptyAssetContainer = styled('div')({
  height: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});
