import { styled } from '@mui/material/styles';

import BottomSheet from '../common/BottomSheet';

export const Container = styled('div')({
  padding: '1.6rem 1.6rem 0',
  overflow: 'hidden',

  display: 'flex',
  flexDirection: 'column',
});

export const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  flexShrink: 0,
});

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    // TODO 공통적으로 바텀시트에 적용시킬 최대 높이값 결정 필요.
    maxHeight: '44rem',
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
