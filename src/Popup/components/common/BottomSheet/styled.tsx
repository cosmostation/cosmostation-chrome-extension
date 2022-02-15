import { Drawer } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: theme.colors.base02,

    width: '33.6rem',

    borderRadius: '0.8rem 0.8rem 0 0 / 0.8rem 0.8rem 0 0',

    margin: '0 auto',
  },
}));
