import type { TooltipProps } from '@mui/material';

import { StyledTooltip } from './styled';

export default function Tooltip(props: TooltipProps) {
  return <StyledTooltip {...props} />;
}
