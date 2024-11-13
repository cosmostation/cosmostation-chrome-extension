import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ContentsContainer = styled('div')({
  paddingLeft: '1rem',

  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.2rem',
});

export const SymbolTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const ChainNameTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));
