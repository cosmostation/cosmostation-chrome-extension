import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import BottomSheet from '@/components/common/BottomSheet';

export const FormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
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
  boxSizing: 'border-box',
  padding: ' 0 1.2rem 1.2rem',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '30rem',
    height: '40%',
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

  wordBreak: 'break-word',

  margin: '1.2rem 0 2.8rem',
}));

export const RedTextSpan = styled('span')(({ theme }) => ({
  color: theme.palette.accentColor.red200,
}));

export const ButtonContainer = styled('div')({
  marginTop: 'auto',
});
