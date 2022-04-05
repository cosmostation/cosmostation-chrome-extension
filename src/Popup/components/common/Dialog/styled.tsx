import { Dialog } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
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
