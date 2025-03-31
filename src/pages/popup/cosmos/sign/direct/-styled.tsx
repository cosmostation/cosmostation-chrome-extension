import { styled } from '@mui/material/styles';

import { TabPanel } from '@/components/common/Tab';

export const InformationContainer = styled('div')({
  marginBottom: '1.2rem',
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
  marginTop: '0',
  display: 'flex',
  flexDirection: 'column',
});
