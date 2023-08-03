import { Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledCircularTabs = styled(Tabs)(({ theme }) => ({
  '&.MuiTabs-root': {
    minHeight: '0',
    borderRadius: '5rem',
    width: '17.2rem',
    height: '3.2rem',
    backgroundColor: theme.colors.base03,
    padding: '0.4rem',
  },
  '& .MuiTabs-indicator': {
    height: '2.4rem',
    borderRadius: '5rem',
    backgroundColor: theme.accentColors.purple01,
  },
  '& .MuiTabs-flexContainer': {
    height: '2.4rem',
    columnGap: '0.2rem',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export const StyledCircularTab = styled(Tab)(({ theme }) => ({
  '&.MuiTab-root': {
    zIndex: 1,
    minWidth: '0',
    padding: '0',
    width: '8rem',
    color: theme.colors.text02,
    fontFamily: theme.typography.h5.fontFamily,
    fontStyle: theme.typography.h5.fontStyle,
    fontSize: theme.typography.h5.fontSize,
    lineHeight: theme.typography.h5.lineHeight,
    letterSpacing: theme.typography.h5.letterSpacing,
    textTransform: 'capitalize',
    backgroundColor: 'transparent',
  },
  '&.Mui-selected': { opacity: 1, color: theme.accentColors.white },
}));

export const CircularTabPanelContainer = styled('div')({
  marginTop: '1.4rem',
  height: '100%',
});
