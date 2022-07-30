import { Drawer } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '*::-webkit-scrollbar': {
    width: '0.1rem',
    height: '0.1rem',
    backgroundColor: 'transparent',
  },
  '*::-webkit-scrollbar-thumb': {
    backgroundColor: theme.colors.base05,
  },
  '*::-webkit-scrollbar-corner': {
    backgroundColor: 'transparent',
  },

  '& .MuiPaper-root': {
    backgroundColor: theme.colors.base01,
    color: theme.colors.text01,

    width: '27rem',
  },
}));

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',

  height: '100%',
});

export const UpContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  overflow: 'hidden',
});

export const DownContainer = styled('div')({
  flexShrink: 0,
});

export const HeaderContainer = styled('div')({
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  height: '5.2rem',

  padding: '0 1.4rem 0 1.2rem',
});

export const HeaderLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const HeaderLeftImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& svg': {
    '& > rect': {
      fill: theme.colors.base06,
    },
    '& > path': {
      stroke: theme.colors.base01,
    },
  },
}));

export const HeaderLeftTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: '0.7rem',

  '& svg': {
    fill: theme.colors.base06,
  },
}));

export const HeaderRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  marginRight: '-0.8rem',

  '& svg': {
    fill: theme.colors.base06,
  },
}));

export const ItemContainer = styled('div')({
  overflow: 'auto',
});

export const ItemToggleContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  height: '4.8rem',

  padding: '0 1.2rem 0 1.2rem',
});

export const ItemButtonContainer = styled('button')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  height: '4.8rem',

  padding: '0 1.2rem 0 1.2rem',

  cursor: 'pointer',

  border: 0,
  backgroundColor: 'transparent',
});

export const ItemLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ItemLeftImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg > path': {
    fill: theme.colors.base05,
  },
}));

export const ItemLeftTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: '0.4rem',

  color: theme.colors.text01,
}));

export const ItemRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& svg': {
    fill: theme.colors.base05,
  },
}));

export const LockButtonContainer = styled('div')({
  flexShrink: 0,
  padding: '1.6rem 1.6rem',

  '& > button': {
    height: '4rem',
  },
});
