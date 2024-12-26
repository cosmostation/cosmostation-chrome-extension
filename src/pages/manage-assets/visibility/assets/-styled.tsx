import { styled } from '@mui/material/styles';

import { TabPanel } from '@/components/common/Tab';

export const Container = styled('div')({
  width: '100%',
});

export const StyledTabPanel = styled(TabPanel)({
  marginTop: '0',
  display: 'flex',
  flexDirection: 'column',
});

export const StickyTabContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base1300,
    '& > path': {
      fill: theme.palette.color.base1300,
    },
  },
}));
