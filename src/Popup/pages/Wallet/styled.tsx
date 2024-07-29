import { styled } from '@mui/material/styles';

import { TabPanel } from '~/Popup/components/common/Tab';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0 1.2rem 0 1.2rem',

  display: 'flex',
  flexDirection: 'column',
});

export const HeaderContainer = styled('div')({
  margin: '0.4rem 0 1.2rem',

  flexShrink: 0,
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  overflow: 'auto',

  margin: '0 -1.2rem',
  padding: '0 1.2rem ',
});

export const NativeChainCardContainer = styled('div')({
  marginTop: '1.2rem',

  flexShrink: 0,
});

export const BottomContainer = styled('div')({
  marginTop: '1.6rem',

  display: 'flex',
  flexDirection: 'column',
});

export const StyledTabPanel = styled(TabPanel)({
  marginTop: '0',
  display: 'flex',
  flexDirection: 'column',
});
