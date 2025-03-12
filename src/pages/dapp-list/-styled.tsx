import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '2.4rem',
  width: '100%',
});

export const StickyContentsContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const FilterContaienr = styled('div')({
  width: '100%',
  marginBottom: '1.2rem',
});

export const InfoIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base1300,
    '& > path': {
      fill: theme.palette.color.base1300,
    },
  },
}));

export const SortConditionContainer = styled('div')({
  display: 'flex',
  padding: '1rem 0.4rem',
});
