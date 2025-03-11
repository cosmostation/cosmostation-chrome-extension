import { styled } from '@mui/material/styles';
import type { TooltipProps } from '@mui/material/Tooltip';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import type { ToolTipVarient } from './index';

type StyledTooltipProps = {
  'data-varient': ToolTipVarient;
};

export const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))<StyledTooltipProps>(({ theme, ...props }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: props['data-varient'] === 'error' ? theme.palette.accentColor.red100 : theme.palette.color.base100,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    marginTop: '1rem !important',

    backgroundColor: props['data-varient'] === 'error' ? theme.palette.accentColor.red100 : theme.palette.color.base100,
    color: theme.palette.color.base1300,
    padding: '0.8rem',

    textAlign: 'center',

    maxWidth: '13rem',
    fontFamily: theme.typography.b4_M.fontFamily,
    fontStyle: theme.typography.b4_M.fontStyle,
    fontSize: theme.typography.b4_M.fontSize,
    lineHeight: theme.typography.b4_M.lineHeight,
    letterSpacing: theme.typography.b4_M.letterSpacing,
  },
}));
