import { Typography as BaseTypography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  marginTop: '1.2rem',
});

export const MarginLeftTypography = styled(BaseTypography)(({ theme }) => ({
  marginLeft: '0.4rem',

  color: theme.palette.color.base1300,
}));
