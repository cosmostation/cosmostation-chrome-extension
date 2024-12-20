import { styled } from '@mui/material/styles';

import BottomSheet from '@/components/common/BottomSheet';
import OutlinedInput from '@/components/common/OutlinedInput';

export const Container = styled('div')({
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

export const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '1.3rem 1.6rem',

  flexShrink: 0,
});

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const StyledInput = styled(OutlinedInput)({
  height: '3.2rem',
});

export const FilterContaienr = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '0.6rem',

  margin: '0.8rem 1.2rem 1.2rem',
});

export const SubHeaderContaienr = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 1.6rem 0.8rem',
});

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
