import { styled } from '@mui/material/styles';

import Switch from '~/Popup/components/common/Switch';

export const ItemContainer = styled('div')({
  width: '100%',
  height: '3.6rem',

  padding: '0 0.4rem 0 3.6rem',

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

  marginLeft: '0.4rem',
}));

export const ItemRightContainer = styled('div')({});

export const StyledSwitch = styled(Switch)({
  width: '4.2rem',
  height: '2.4rem',

  '&:active': {
    '& .MuiSwitch-thumb': {
      width: '1.8rem',
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(1.7rem)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: '0.4rem',

    '&.Mui-checked': {
      transform: 'translateX(1.8rem)',
    },
  },
  '& .MuiSwitch-thumb': {
    width: '1.6rem',
    height: '1.6rem',
  },
});
