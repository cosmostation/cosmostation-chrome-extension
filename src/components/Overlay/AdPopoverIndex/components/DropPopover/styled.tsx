import { styled } from '@mui/material/styles';

import Button from '@/components/common/Button';

export const StyledButton = styled(Button)({
  width: '40%',
  height: '4rem',
  backgroundColor: '#6F4AFF',
  '&:hover': {
    backgroundColor: '#6443E5',
  },
});
