import { styled } from '@mui/material/styles';

import BottomSheet from '@/components/common/BottomSheet';

export const Container = styled('div')({
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
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
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '60%',
    maxHeight: '90%',
  },
});

export const FeeCustomContainer = styled('div')({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: '0.6rem',
  margin: '2.2rem 0',
});
