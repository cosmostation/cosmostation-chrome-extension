import type { IconButtonProps } from '@mui/material';

import { StyledIconButton } from './styled';

export default function InputAdornmentIconButton({ ...remainder }: IconButtonProps) {
  return <StyledIconButton type="button" {...remainder} />;
}
