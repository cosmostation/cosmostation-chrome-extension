import type { OutlinedInputProps } from '@mui/material';

import { StyledTextField } from './styled';

export default function OutlinedInput(props: OutlinedInputProps) {
  return <StyledTextField {...props} />;
}
