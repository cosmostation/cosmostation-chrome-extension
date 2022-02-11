import type { IconButtonProps } from '@mui/material';

import { StyledIconButton } from './styled';

export default function IconButton(props: IconButtonProps) {
  return <StyledIconButton {...props} />;
}
