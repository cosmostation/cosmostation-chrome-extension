import { styled } from '@mui/material/styles';
import type { TooltipProps } from '@mui/material/Tooltip';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

export const StyledTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} arrow classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.colors.base01,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    marginTop: '1rem !important',

    backgroundColor: theme.colors.base01,
    color: theme.colors.text01,
    padding: '0.8rem',

    textAlign: 'center',

    maxWidth: '13rem',
    fontFamily: theme.typography.h7.fontFamily,
    fontStyle: theme.typography.h7.fontStyle,
    fontSize: theme.typography.h7.fontSize,
    lineHeight: theme.typography.h7.lineHeight,
    letterSpacing: theme.typography.h7.letterSpacing,
  },
}));
