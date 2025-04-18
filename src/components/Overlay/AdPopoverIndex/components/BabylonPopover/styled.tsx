import { styled } from '@mui/material/styles';

import Button from '@/components/common/Button';

export const StyledButton = styled(Button)({
  width: '40%',
  height: '4rem',
  backgroundColor: '#FF872C',
  '&:hover': {
    backgroundColor: '#E57A28',
  },
});
