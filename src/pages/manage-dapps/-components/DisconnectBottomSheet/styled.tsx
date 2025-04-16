import { styled } from '@mui/material/styles';

import BottomSheet from '@/components/common/BottomSheet';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
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
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  padding: '1.2rem',

  flex: 1,
});

export const TextContaienr = styled('div')({
  width: '95%',
  wordBreak: 'break-word',
  textAlign: 'start',
  whiteSpace: 'pre-wrap',
});

export const Footer = styled('div')({
  marginTop: 'auto',
  padding: '1.2rem',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '30%',
  },
});
