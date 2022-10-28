import { Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
// https://mui-treasury.com/styles/tabs/#Apple
export const StyledTabs = styled(Tabs)(({ theme }) => ({
  '&.MuiTabs-root': {
    minHeight: '0',
    borderRadius: '5rem',
    width: '17.2rem',
    height: '3.2rem',
    backgroundColor: theme.colors.base03,
    display: 'flex',
    alignItems: 'center',
    padding: '0.4rem',
  },
  '& .MuiTabs-indicator': {
    minWidth: '0',
    minHeight: '0',
    // 중앙정렬 필요
    top: '1.25rem',
    height: '2.4rem',
    background: 'none',
    borderRadius: '5rem',
    backgroundColor: theme.accentColors.purple01,
  },
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  zIndex: 2,
  '&.MuiTab-root': {
    minWidth: '0',
    padding: '0',
    width: '8.2rem',
    height: '5rem',
    color: theme.colors.text02,
    fontFamily: theme.typography.h5.fontFamily,
    fontStyle: theme.typography.h5.fontStyle,
    fontSize: theme.typography.h5.fontSize,
    lineHeight: theme.typography.h5.lineHeight,
    letterSpacing: theme.typography.h5.letterSpacing,
    backgroundColor: 'transparent',
  },
  '&.Mui-selected': { opacity: 1, color: theme.colors.text01, padding: '0' },
  '&.Mui-unselected': {
    opacity: 1,
    color: theme.colors.text02,
    // FIXME unselected 호버링 시 색 바뀌게할것
    // '&:hover': {
    //   opacity: 0.7,
    //   color: theme.colors.red01,
    // },
  },
}));

// NOTE 이러면 서큐러 탭의 탭패널만 마진탑이 다른데... 이거 상관없나?
export const TabPanelContainer = styled('div')({
  marginTop: '1.4rem',
});
