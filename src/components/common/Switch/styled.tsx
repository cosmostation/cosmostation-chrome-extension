import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

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
      transform: 'translateX(1.8rem)',
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
        backgroundColor: theme.palette.accentColor.purple200,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.color.base100,
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
    backgroundColor: theme.palette.color.base600,
    transition: theme.transitions.create(['width'], {
      duration: 250,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 'calc(3.2rem / 2)',
    opacity: 1,
    backgroundColor: theme.palette.color.base100,
    border: `0.1rem solid ${theme.palette.color.base200}`,
    boxSizing: 'border-box',
  },
}));
