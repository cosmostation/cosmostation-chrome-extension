import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

export const DateLineContainer = styled('div')({
  marginBottom: '0.6rem',
});

export const TxDetailContainer = styled('div')({});

export const AmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.color.base1300,
}));

type SymbolTextProps = {
  'data-symbol-color'?: string;
};

export const SymbolText = styled(Typography)<SymbolTextProps>(({ theme, ...props }) => ({
  color: props['data-symbol-color'] ? props['data-symbol-color'] : theme.palette.color.base1300,
}));

export const ChainContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',
});

export const ChainImageContainer = styled('div')({
  width: '1.6rem',
  height: '1.6rem',

  '& > img': {
    width: '100%',
    height: '100%',
  },
});
