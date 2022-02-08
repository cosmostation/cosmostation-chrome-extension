import type { CheckboxProps } from '@mui/material/Checkbox';

import { StyledCheckbox } from './styled';

export default function Checkbox(props: CheckboxProps) {
  return <StyledCheckbox {...props} />;
}
