import { styled } from '@mui/material/styles';

import IconButton from '../common/IconButton';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.8rem',
});

export const NaviagteIconButton = styled(IconButton)({
  position: 'relative',

  width: '2rem',
  height: '2rem',

  '&:hover': {
    opacity: '0.8',
  },
  '&:disabled': {
    opacity: '0.4',
  },
});
