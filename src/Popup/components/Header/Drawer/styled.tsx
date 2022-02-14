import { Drawer } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: theme.colors.base01,
    color: theme.colors.text01,

    width: '27rem',
  },
}));

export const HeaderContainer = styled('div')({
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
    fill: theme.colors.base06,
  },
}));

export const HeaderLeftTextContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: '0.7rem',
});

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

  '& svg': {
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
  marginTop: '1.6rem',

  padding: '0 1.6rem',

  '& > button': {
    height: '4rem',
  },
});
