import type { IconButtonProps } from '@mui/material';

import { StyledIconButton } from './styled';

export default function IconButton({ type, ...remainder }: IconButtonProps) {
  return <StyledIconButton disableRipple type={type ?? 'button'} {...remainder} />;
}
