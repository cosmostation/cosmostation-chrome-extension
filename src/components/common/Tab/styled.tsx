import type { TabsProps } from '@mui/material';
import { Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledTabs = styled((props: TabsProps) => <Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />)(
  ({ theme }) => ({
    '&.MuiTabs-root': {
      minHeight: 0,
    },
    '& .MuiTabs-indicator': {
      zIndex: 1,
      backgroundColor: 'transparent',

      display: 'flex',
      justifyContent: 'center',
    },

    '& .MuiTabs-indicatorSpan': {
      maxWidth: '20%',
      width: '100%',
      borderTopLeftRadius: '0.4rem',
      borderTopRightRadius: '0.4rem',
      backgroundColor: theme.palette.color.base200,
    },
  }),
);

export const StyledTab = styled(Tab)(({ theme }) => ({
  '&.MuiTab-root': {
    textTransform: 'none',
    color: theme.palette.color.base600,

    fontFamily: theme.typography.h3_B.fontFamily,
    fontStyle: theme.typography.h3_B.fontStyle,
    fontSize: theme.typography.h3_B.fontSize,
    lineHeight: theme.typography.h3_B.lineHeight,
    letterSpacing: theme.typography.h3_B.letterSpacing,
  },

  '&.Mui-selected': { opacity: 1, color: theme.palette.color.base1300 },
}));

export const TabsContainer = styled('div')(({ theme }) => ({
  position: 'relative',

  borderBottom: `0.06rem solid ${theme.palette.color.base200}`,
}));

export const TabPanelContainer = styled('div')({
  padding: '0.8rem 0',
});
