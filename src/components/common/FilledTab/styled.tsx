import type { TabsProps } from '@mui/material';
import { Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledTabs = styled((props: TabsProps) => <Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />)(
  ({ theme }) => ({
    '&.MuiTabs-root': {
      minHeight: 0,
      padding: '0.2rem',
      boxSizing: 'border-box',
    },
    '& .MuiTabs-indicator': {
      height: '2.8rem',
      borderRadius: '0.4rem',
      backgroundColor: theme.palette.color.base300,
      top: '50%',
      transform: 'translateY(-50%)',
      boxSizing: 'border-box',
    },

    '& .MuiTabs-flexContainer': {
      height: '2.8rem',
      boxSizing: 'border-box',
    },
  }),
);

export const StyledTab = styled(Tab)(({ theme }) => ({
  '&.MuiTab-root': {
    zIndex: 1,
    height: '2.8rem',
    padding: '0',
    minHeight: '0',

    boxSizing: 'border-box',

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

export const TabsWrapper = styled('div')(({ theme }) => ({
  padding: '0.8rem 1.2rem',

  backgroundColor: theme.palette.color.base50,
}));

export const TabsContainer = styled('div')(({ theme }) => ({
  position: 'relative',

  backgroundColor: theme.palette.color.base100,

  borderRadius: '0.6rem',
}));

export const TabPanelContainer = styled('div')({
  padding: '0',
});
