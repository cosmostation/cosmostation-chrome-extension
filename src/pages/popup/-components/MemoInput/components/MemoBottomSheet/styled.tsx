import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import BottomSheet from '@/components/common/BottomSheet';
import Button from '@/components/common/Button';

export const Container = styled('div')({
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',

  height: '100%',
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
  flexDirection: 'column',
  height: '100%',

  margin: '0 1.6rem 1.2rem',

  boxSizing: 'border-box',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    maxHeight: '75%',
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

export const DescriptionText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,

  maxWidth: '90%',

  wordBreak: 'break-word',

  margin: '1.2rem 0 2.8rem',
}));

export const ConfirmButton = styled(Button)({
  marginTop: 'auto',
});
