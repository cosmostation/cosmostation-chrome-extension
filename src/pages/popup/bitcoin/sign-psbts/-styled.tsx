import { styled } from '@mui/material/styles';

import { TabPanel } from '@/components/common/Tab';

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
}));

export const LineDivider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.4rem solid ${theme.palette.color.base100}`,
}));

export const TxBaseInfoContainer = styled('div')({
  padding: '1.1rem 1.6rem',
});

export const DividerContainer = styled('div')({
  padding: '0 1.6rem',
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

export const StyledTabPanel = styled(TabPanel)({
  marginTop: '0',
  display: 'flex',
  flexDirection: 'column',
});

export const RawTxContainer = styled('div')({
  padding: '0 1.2rem',
});

export const SticktFooterInnerBody = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',

  boxSizing: 'border-box',

  position: 'sticky',
  bottom: 0,
  zIndex: 1000,
  padding: '1.2rem 0',
  marginBottom: '-1.2rem',

  backgroundColor: theme.palette.color.base50,
}));

export const RawTxMessage = styled('div')(({ theme }) => ({
  padding: '1.6rem',

  backgroundColor: theme.palette.color.base200,

  color: theme.palette.commonColor.commonWhite,
  borderRadius: '0.8rem',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  boxSizing: 'border-box',
}));

export const TxMessageContainer = styled('div')({
  padding: '0 1.6rem',
});

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  paddingTop: '9rem',
});
