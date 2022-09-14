import { styled } from '@mui/material/styles';

export const ItemContainer = styled('div')({
  width: '100%',
  height: '4rem',

  padding: '0 0.4rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const ItemLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ItemLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const ItemLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  marginLeft: '0.8rem',
}));

export const ItemRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});
