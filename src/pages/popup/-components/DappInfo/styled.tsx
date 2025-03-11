import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  padding: '1.2rem',
  boxSizing: 'border-box',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  columnGap: '1rem',
});

export const ContentsInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.4rem',
});

export const EllipsisContainer = styled('div')({
  display: 'flex',

  maxWidth: '27rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
