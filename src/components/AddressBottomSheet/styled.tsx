import { styled } from '@mui/material/styles';

import BottomSheet from '../common/BottomSheet';
import { FilledTabPanel } from '../common/FilledTab';

export const Container = styled('div')({
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  flex: '1',
});

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '1.6rem',

  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,

  flexShrink: 0,
}));

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const Body = styled('div')({
  width: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  height: '100%',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '70%',
    maxHeight: '90%',
  },
});

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: 0,
  margin: 0,
  border: 0,

  height: '2.4rem',

  cursor: 'pointer',

  '& > svg': {
    fill: theme.palette.color.base400,
  },
}));

export const TabPanelContentsContainer = styled('div')({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  height: '100%',
});

type StyledTabPanelProps = {
  'data-is-active': boolean;
};

export const StyledTabPanel = styled(FilledTabPanel)<StyledTabPanelProps>(({ ...props }) => ({
  marginTop: '0',
  display: 'flex',
  flexDirection: 'column',
  flex: props['data-is-active'] ? '1' : '0',
  height: '100%',
}));

export const SearchContainer = styled('div')({
  padding: '0 1.2rem 0.6rem',
});
