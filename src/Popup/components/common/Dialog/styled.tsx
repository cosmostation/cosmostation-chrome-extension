import { Dialog } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.colors.base01,
    color: theme.colors.text01,

    width: '33.6rem',
    maxHeight: '48rem',

    borderRadius: '0.8rem',
  },
}));
