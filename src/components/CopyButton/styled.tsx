import type { IconButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

import IconButton from '../common/IconButton';

export const StyledButton = styled(IconButton)<IconButtonProps>(() => ({}));

export const ContentWrapper = styled('div')(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
}));

export const IconWrapper = styled('div')(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
}));

export const StyledIconWrapper = styled('div')(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'opacity 0.3s ease',
  '&.visible': {
    opacity: 1,
  },
  '&.hidden': {
    opacity: 0,
  },
}));
