import type { TooltipProps } from '@mui/material';

import { StyledTooltip } from './styled';

export type ToolTipVarient = 'basic' | 'error';

export default function Tooltip({ varient = 'basic', ...remainder }: TooltipProps & { varient?: ToolTipVarient }) {
  return <StyledTooltip {...remainder} data-varient={varient} />;
}
