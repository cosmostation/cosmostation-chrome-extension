import { Popover } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledPopover = styled(Popover)(({ theme }) => ({
  '*::-webkit-scrollbar': {
    width: '0.1rem',
    height: '0.1rem',
    backgroundColor: 'transparent',
  },
  '*::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.color.base500,
  },
  '*::-webkit-scrollbar-corner': {
    backgroundColor: 'transparent',
  },

  '& .MuiPaper-root': {
    backgroundColor: theme.palette.color.base100,

    color: theme.palette.color.base500,

    maxWidth: 'max-content',
    height: 'max-content',

    borderRadius: '0.4rem',

    marginTop: '0.4rem',
    backgroundImage: 'none',
  },
}));
