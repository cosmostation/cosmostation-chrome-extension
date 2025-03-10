import { styled } from '@mui/material/styles';

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

export const LabelContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const DetailWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1.6rem',
});

export const InformationContainer = styled('div')({
  marginBottom: '1.6rem',
});
