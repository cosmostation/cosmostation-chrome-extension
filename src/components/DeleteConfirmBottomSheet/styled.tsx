import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import BottomSheet from '@/components/common/BottomSheet';
import Button from '@/components/common/Button';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,

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
  justifyContent: 'center',
  height: '100%',

  margin: '0 1.6rem 1.2rem',

  boxSizing: 'border-box',
  flex: 1,
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  paddingTop: '10%',
  rowGap: '2rem',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '45%',
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
  width: '80%',

  color: theme.palette.color.base1100,

  wordBreak: 'break-word',
  textAlign: 'center',
}));

export const ConfirmButton = styled(Button)({});

export const Footer = styled('div')({
  marginTop: 'auto',
  padding: '1.2rem',
});
