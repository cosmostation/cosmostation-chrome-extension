import type { DialogProps } from '@mui/material';

import { StyledDialog } from './styled';

export default function Dialog(props: DialogProps) {
  return <StyledDialog {...props} aria-labelledby="dialog-title" aria-describedby="dialog-description" />;
}
