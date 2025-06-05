import { styled } from '@mui/material/styles';

import Dialog from '../common/Dialog';

export const StyledDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    minHeight: '80%',
    margin: '0 1.2rem',
  },
});

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  margin: '1.6rem 1.6rem 0',
  paddingBottom: '1.6rem',

  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,

  flexShrink: 0,
}));

export const HeaderTitle = styled('div')(({ theme }) => ({
  display: 'flex',
  color: theme.palette.color.base1300,
  columnGap: '0.4rem',
  alignItems: 'center',
}));

export const Body = styled('div')({
  width: '100%',
  height: '100%',
  overflow: 'auto',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: '1.2rem 1.6rem',
  boxSizing: 'border-box',
});

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: 0,
  margin: 0,
  border: 0,

  height: '2.4rem',

  cursor: 'pointer',

  '& > svg': {
    fill: theme.palette.color.base400,
  },
}));

export const JsonContainer = styled('div')({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});
