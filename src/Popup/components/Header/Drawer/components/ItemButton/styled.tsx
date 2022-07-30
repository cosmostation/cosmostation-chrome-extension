import { styled } from '@mui/material/styles';

export const ItemButtonContainer = styled('button')({
  width: '100%',
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
