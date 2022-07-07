import { Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  '&.MuiTabs-root': {
    minHeight: 0,
  },
  '& .MuiTabs-indicator': {
    zIndex: 1,
    backgroundColor: theme.accentColors.purple01,
  },
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  '&.MuiTab-root': {
    textTransform: 'none',
    color: theme.colors.text02,

    fontFamily: theme.typography.h5.fontFamily,
    fontStyle: theme.typography.h5.fontStyle,
    fontSize: theme.typography.h5.fontSize,
    lineHeight: theme.typography.h5.lineHeight,
    letterSpacing: theme.typography.h5.letterSpacing,

    opacity: 1,

    minHeight: 0,

    padding: '1.2rem 1.6rem',
  },

  '&.Mui-selected': { opacity: 1, color: theme.accentColors.purple01 },
}));

export const TabsIndicator = styled('div')(({ theme }) => ({
  position: 'absolute',
  height: '0.2rem',
  width: '100%',
  bottom: 0,
  backgroundColor: theme.colors.base03,
}));

export const TabsContainer = styled('div')({ position: 'relative' });

export const TabPanelContainer = styled('div')({
  marginTop: '1rem',
});
