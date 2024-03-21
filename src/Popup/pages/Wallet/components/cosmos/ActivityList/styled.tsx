import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  height: '30rem',

  display: 'flex',
  paddingBottom: '1.6rem',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const ContentsContainer = styled('div')({
  height: '100%',

  overflow: 'auto',
});

export const ActivityContainer = styled('div')({});

export const ActivityWrapperContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  rowGap: '1.2rem',
});

export const ActivityDateContainer = styled('div')(({ theme }) => ({
  margin: '0 0 0.8rem 0.8rem',

  color: theme.colors.text01,
}));

export const ActivityListContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  rowGap: '0.8rem',

  overflow: 'auto',
});

export const EmptyAssetContainer = styled('div')({
  height: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});
