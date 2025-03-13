import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
});

export const StickyContentsContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  padding: '0.8rem 0',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const CarouselWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const CarouselContainer = styled('div')({
  flex: 1,
  overflow: 'hidden',
});

export const ChipButtonContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const ChipButtonContentsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',
});

export const LeftChevronIconContainer = styled('div')(() => ({
  width: '2rem',
  height: '2rem',
  transform: 'rotate(180deg)',
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
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 0.4rem',
});

export const GridContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
  rowGap: '1.6rem',
  columnGap: '1rem',
});
