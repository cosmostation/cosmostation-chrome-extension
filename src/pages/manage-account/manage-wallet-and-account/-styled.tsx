import { styled } from '@mui/material/styles';

import { FilledTabPanel } from '@/components/common/FilledTab';
import TextButton from '@/components/common/TextButton';

export const CoinContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const Divider = styled('div')(({ theme }) => ({
  marginBottom: '1.2rem',
  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
}));

export const SaveButton = styled(TextButton)(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
}));

export const StickyTabContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const FooterContainer = styled('div')(({ theme }) => ({
  padding: '1.2rem',

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
