import { styled } from '@mui/material/styles';

import { TabPanel } from '@/components/common/Tab';

export const Container = styled('div')({
  width: '100%',
});

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.4rem solid ${theme.palette.color.base100}`,
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
  marginTop: '0.8rem',
});

export const EmptyAssetContainer = styled('div')({
  position: 'absolute',

  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  display: 'flex',
  flexDirection: 'column',

  alignItems: 'center',
  paddingTop: '30rem',
});

export const ChipButtonContentsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  marginLeft: '0.4rem',
  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.color.base1000,

    '& > path': {
      fill: theme.palette.color.base1000,
    },
  },
}));
