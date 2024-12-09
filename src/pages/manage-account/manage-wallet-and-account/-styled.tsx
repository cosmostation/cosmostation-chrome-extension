import { styled } from '@mui/material/styles';

import TextButton from '@/components/common/TextButton';

export const CoinContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const Divider = styled('div')(({ theme }) => ({
  marginBottom: '1.2rem',
  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
}));

export const SaveButton = styled(TextButton)(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
}));
