import type { SwitchProps } from '@mui/material/Switch';

import { StyledSwitch } from './styled';

export default function Switch(props: SwitchProps) {
  return <StyledSwitch disableRipple {...props} />;
}
