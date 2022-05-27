import { styled } from '@mui/material/styles';

import { TabPanel } from '~/Popup/components/common/Tab';

export const Container = styled('div')({
  position: 'relative',

  height: '100%',
});

export const ContentContainer = styled('div')({
  height: 'calc(100% - 17.6rem)',

  padding: '1.2rem 1.6rem 0',
});

export const StyledTabPanel = styled(TabPanel)({
  height: 'calc(100% - 5.6rem)',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',
  left: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const BottomButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
});
