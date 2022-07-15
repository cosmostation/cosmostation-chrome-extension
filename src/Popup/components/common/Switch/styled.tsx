import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

export const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: '4.8rem',
  height: '2.8rem',
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: '2rem',
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(2rem)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: '0.5rem',

    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    '&.Mui-checked': {
      transform: 'translateX(2rem)',
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
    width: '1.8rem',
    height: '1.8rem',
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
