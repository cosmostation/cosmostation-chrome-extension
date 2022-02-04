import type { TextFieldProps } from '@mui/material';

import { StyledTextField } from './styled';

export default function TextField(props: TextFieldProps) {
  return <StyledTextField {...props} />;
}
