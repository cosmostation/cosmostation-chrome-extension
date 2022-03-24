import { Tab as BaseTab, Tabs as BaseTabs } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '2rem 1.6rem 1.6rem 1.6rem',

  position: 'relative',

  height: '100%',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const BottomButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',

  color: theme.colors.text01,
}));

export const TabContainer = styled('div')(({ theme }) => ({ color: theme.colors.text02, position: 'relative', marginTop: '0.4rem' }));

export const TabIndicatorContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  height: '0.2rem',
  width: '100%',
  bottom: 0,
  backgroundColor: theme.colors.base03,
}));

export const Tabs = styled(BaseTabs)(({ theme }) => ({
  '&.MuiTabs-root': {
    minHeight: 0,
  },
  '& .MuiTabs-indicator': {
    zIndex: 1,
    backgroundColor: theme.accentColors.purple01,
  },
}));

export const Tab = styled(BaseTab)(({ theme }) => ({
  '&.MuiTab-root': {
    textTransform: 'none',

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

export const TabPanelContainer = styled('div')({
  marginTop: '1.6rem',
});

export const PaginationContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  marginTop: '0.8rem',
});

export const MemoContainer = styled('div')({
  marginTop: '1.2rem',
});

export const FeeContainer = styled('div')({
  marginTop: '1.2rem',
});
