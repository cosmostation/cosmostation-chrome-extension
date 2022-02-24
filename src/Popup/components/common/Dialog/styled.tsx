import { Dialog } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.colors.base01,
    color: theme.colors.text01,

    width: '32rem',
    maxHeight: '48rem',

    margin: 0,

    borderRadius: '0.8rem',

    border: `0.1rem solid ${theme.colors.base03}`,
  },
}));
