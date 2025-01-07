import { styled } from '@mui/material/styles';

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.accentColor.red400,
    '& > path': {
      fill: theme.palette.accentColor.red400,
    },
  },
}));

export const DeleteTextContainer = styled('div')(({ theme }) => ({
  color: theme.palette.accentColor.red400,
}));

export const StickyContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));
