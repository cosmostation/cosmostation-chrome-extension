import type { PopoverProps } from '@mui/material/Popover';

import { StyledPopover } from './styled';

export default function Popover(props: PopoverProps) {
  return <StyledPopover {...props} />;
}
