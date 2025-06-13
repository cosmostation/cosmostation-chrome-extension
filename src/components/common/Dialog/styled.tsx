import { Dialog } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '*::-webkit-scrollbar': {
    width: '0.1rem',
    height: '0.1rem',
    backgroundColor: 'transparent',
  },
  '*::-webkit-scrollbar-thumb': {
    display: 'none',
  },
  '*::-webkit-scrollbar-corner': {
    backgroundColor: 'transparent',
  },

  '& .MuiPaper-root': {
    maxWidth: '52rem',
    backgroundColor: theme.palette.color.base50,
    margin: '0 auto',
    borderRadius: '0.6rem',
    '--Paper-overlay': 'none !important',
  },

  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
}));
