import { styled } from '@mui/material/styles';

import TextButton from '@/components/common/TextButton';

export const CoinBoxContainer = styled('div')({
  position: 'relative',
});

export const SwapInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',

  marginBottom: '1.2rem',
});

export const SwapInfoRowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const SlippageTextButton = styled(TextButton)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const CoinBoxDivider = styled('div')(({ theme }) => ({
  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
}));

export const Divider = styled('div')(({ theme }) => ({
  marginBottom: '1.2rem',
  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
}));

export const InformContainer = styled('div')({
  marginTop: '0.8rem',
});

export const InformAmountSpan = styled('span')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));
