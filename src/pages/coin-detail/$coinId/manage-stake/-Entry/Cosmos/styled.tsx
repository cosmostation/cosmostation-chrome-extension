import { styled } from '@mui/material/styles';

import { TabPanel } from '@/components/common/Tab';

export const Container = styled('div')({
  width: '100%',
});

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.2rem solid ${theme.palette.color.base100}`,
}));

export const TabWrapper = styled('div')({
  padding: '0.8rem 1.2rem',
});

export const StickyTabContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const StyledTabPanel = styled(TabPanel)({
  marginTop: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
});

export const StickyTabPanelContentsContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '7.8rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const StakingItemContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.8rem',
});
