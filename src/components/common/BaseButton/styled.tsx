import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(() => ({
  padding: '0',

  border: 'none',

  backgroundColor: 'transparent',

  cursor: 'pointer',

  '&: disabled': {
    cursor: 'not-allowed',
  },
}));
