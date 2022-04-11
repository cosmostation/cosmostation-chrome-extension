import { Popover } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledPopover = styled(Popover)(({ theme }) => ({
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

    border: `1px solid ${theme.colors.base03}`,

    color: theme.colors.text01,

    maxWidth: 'max-content',
    height: 'max-content',

    borderRadius: '0.8rem',

    marginTop: '0.7rem',
  },
}));
