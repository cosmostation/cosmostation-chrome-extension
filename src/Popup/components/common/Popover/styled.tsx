import { Popover } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: theme.colors.base01,

    border: `1px solid ${theme.colors.base03}`,

    color: theme.colors.text01,

    width: 'max-content',
    height: 'max-content',

    borderRadius: '0.8rem',

    marginTop: '0.7rem',
  },
}));
