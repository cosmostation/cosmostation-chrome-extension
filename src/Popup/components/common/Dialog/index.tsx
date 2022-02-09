import type { DialogProps } from '@mui/material';

import { StyledDialog } from './styled';

export default function Dialog({ ...remainder }: DialogProps) {
  return <StyledDialog {...remainder} />;
}
