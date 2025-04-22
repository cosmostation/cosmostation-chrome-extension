import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',

  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

export const ChipButtonContentsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',
  flexShrink: '0',
});

export const IconContainer = styled('div')({
  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

export const LeftChevronIconContainer = styled('div')(() => ({
  width: '2rem',
  height: '2rem',
  transform: 'rotate(180deg)',
}));
