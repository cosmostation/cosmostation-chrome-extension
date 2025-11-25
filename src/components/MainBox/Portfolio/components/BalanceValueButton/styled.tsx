import { styled } from '@mui/material/styles';

import IconButton from '@/components/common/IconButton';

export const Container = styled('div')({
  display: 'flex',
});

export const ValueButton = styled('button')({
  backgroundColor: 'transparent',
  padding: 0,
  margin: 0,
  border: 0,

  cursor: 'pointer',

  '&:hover': {
    opacity: 0.7,
  },
});

export const StyledIconButton = styled(IconButton)({
  height: '3rem',
  width: '4rem',
  display: 'flex',
  justifyContent: 'flex-start',
});
