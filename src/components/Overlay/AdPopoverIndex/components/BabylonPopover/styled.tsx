import { styled } from '@mui/material/styles';

import Button from '@/components/common/Button';

export const StyledButton = styled(Button)({
  width: '40%',
  height: '3.6rem',
  backgroundColor: '#FF872C',
  '&:hover': {
    opacity: '0.8',
    backgroundColor: '#FF872C',
  },
});
