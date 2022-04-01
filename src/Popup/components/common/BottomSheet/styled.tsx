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

    width: '33.6rem',

    borderRadius: '0.8rem 0.8rem 0 0 / 0.8rem 0.8rem 0 0',

    margin: '0 auto',
  },
}));
