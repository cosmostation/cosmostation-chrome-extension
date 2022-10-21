import { Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
// https://mui-treasury.com/styles/tabs/#Apple
export const StyledTabs = styled(Tabs)(({ theme }) => ({
  '&.MuiTabs-root': {
    minHeight: 0,
    borderRadius: '5rem',
    width: '17.2rem',
    height: '3.2rem',
    backgroundColor: theme.colors.base03,
    flexContainer: {
      display: 'inline-flex',
      position: 'relative',
      zIndex: 1,
    },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '& .MuiTabs-indicator': {
    // top: 4,
    // bottom: 4,
    // right: 4,
    width: '4rem',
    height: '2.4rem',
    background: 'none',
    '&:after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 4,
      left: 4,
      right: 4,
      bottom: 4,
      borderRadius: '5rem',
      backgroundColor: theme.accentColors.purple01,
      // boxShadow: '0 4px 12px 0 rgba(0,0,0,0.16)',
    },
  },
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  zIndex: 2,
  // marginTop: spacing(0.5),
  backgroundColor: theme.colors.base01,
  '&.MuiTab-root': {
    '&:hover': {
      opacity: 1,
    },
    textTransform: 'initial',
    color: theme.colors.text02,
    fontFamily: theme.typography.h5.fontFamily,
    fontStyle: theme.typography.h5.fontStyle,
    fontSize: theme.typography.h5.fontSize,
    lineHeight: theme.typography.h5.lineHeight,
    letterSpacing: theme.typography.h5.letterSpacing,
    backgroundColor: 'transparent',
    opacity: 1,
    minHeight: 0,
  },
  '&.Mui-selected': { opacity: 1, color: theme.colors.text01 },
}));

export const TabsContainer = styled('div')({ position: 'relative' });
// NOTE 이러면 서큐러 탭의 탭패널만 마진탑이 다른데... 이거 상관없나?
export const TabPanelContainer = styled('div')({
  marginTop: '1.4rem',
});
