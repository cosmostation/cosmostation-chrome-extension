import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

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
    width: '2rem',
    height: '2rem',
  },
});

export const ItemLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  marginLeft: '0.8rem',
}));

export const ItemRightContainer = styled('div')({});

export const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: '4.2rem',
  height: '2.4rem',
  padding: 0,
  display: 'flex',
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

    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    '&.Mui-checked': {
      transform: 'translateX(1.8rem)',

      color: '#fff',

      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0)',
      },
      '& .MuiSwitch-thumb': {
        backgroundColor: theme.accentColors.purple01,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.colors.base02,
      },
    },
    '&.Mui-disabled': {
      opacity: 0.3,
    },
    '&.Mui-disabled+': {
      opacity: 0.3,
      '&.MuiSwitch-track': {
        opacity: 0.3,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: '1.6rem',
    height: '1.6rem',
    borderRadius: '0.9rem',
    backgroundColor: theme.colors.base05,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 'calc(3.2rem / 2)',
    opacity: 1,
    backgroundColor: theme.colors.base02,
    border: `0.1rem solid ${theme.colors.base04}`,
    boxSizing: 'border-box',
  },
}));
