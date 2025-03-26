import { styled } from '@mui/material/styles';

import { FilledTabPanel } from '@/components/common/FilledTab';

export const Container = styled('div')({
  width: '100%',
});

export const StickyTabContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const TabPanelContentsContainer = styled('div')({
  overflow: 'auto',
});

export const StyledTabPanel = styled(FilledTabPanel)({
  marginTop: '0',
  display: 'flex',
  flexDirection: 'column',
});

export const EmptyAssetContainer = styled('div')({
  position: 'absolute',

  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});
