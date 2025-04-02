import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledIconButton = styled(IconButton)({
  padding: '0',

  '&:hover': {
    opacity: 0.8,
  },

  cursor: 'pointer',
});
