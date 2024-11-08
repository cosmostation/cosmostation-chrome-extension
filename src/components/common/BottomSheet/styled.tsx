import { Drawer } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '*::-webkit-scrollbar': {
    width: '0.1rem',
    height: '0.1rem',
    backgroundColor: 'transparent',
  },
  '*::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.color.base600,
  },
  '*::-webkit-scrollbar-corner': {
    backgroundColor: 'transparent',
  },

  '& .MuiPaper-root': {
    maxWidth: '55rem',

    backgroundColor: theme.palette.color.base200,

    margin: '0 auto',
  },
}));
