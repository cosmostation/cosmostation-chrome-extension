import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '2rem 1.6rem 1.6rem 1.6rem',

  position: 'relative',

  height: '100%',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const BottomButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',

  color: theme.colors.text01,
}));

export const TabContainer = styled('div')({ marginTop: '0.4rem' });

export const PaginationContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  marginTop: '0.8rem',
});

export const MemoContainer = styled('div')({
  marginTop: '1.2rem',
});

export const FeeContainer = styled('div')({
  marginTop: '1.2rem',
});
