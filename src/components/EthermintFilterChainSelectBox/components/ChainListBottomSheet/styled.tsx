import { styled } from '@mui/material/styles';

import BaseOptionButton from '@/components/common/BaseOptionButton';
import BottomSheet from '@/components/common/BottomSheet';

export const Container = styled('div')({
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

export const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '1.6rem',

  flexShrink: 0,
});

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const Body = styled('div')({
  width: '100%',
  overflow: 'auto',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    height: '85%',
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

export const FilterContaienr = styled('div')({
  width: '100%',

  padding: '0rem 1.2rem 1.2rem',

  boxSizing: 'border-box',
});

export const ManageAssetsContaienr = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1.2rem',
});

export const CustomNetworkButton = styled(BaseOptionButton)(({ theme }) => ({
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
  borderTop: `0.1rem solid ${theme.palette.color.base100}`,

  '& > svg': {
    fill: theme.palette.color.base1300 + ' !important',
    '& > path': {
      fill: theme.palette.color.base1300 + ' !important',
    },
  },
}));

export const CustomNetworkContaienr = styled('div')(({ theme }) => ({
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
  borderTop: `0.1rem solid ${theme.palette.color.base100}`,
}));

export const CustomNetworkTextContaienr = styled('div')({
  wordBreak: 'break-word',
  textAlign: 'start',
  whiteSpace: 'pre-wrap',
});

export const NetworkInfoContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 1.6rem',
  marginBottom: '1.2rem',
});

export const NetworkCounts = styled('span')(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const SwtichCoinType = styled('div')(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
  marginLeft: '0.2rem',
}));
