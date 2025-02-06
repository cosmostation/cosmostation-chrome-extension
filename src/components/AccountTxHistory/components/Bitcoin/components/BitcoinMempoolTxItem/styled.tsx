import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const AmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.color.base1300,
}));

export const TitleContainer = styled('div')({
  display: 'flex',
});

export const StatusContainer = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.accentColor.blue400,
}));

type SymbolTextProps = {
  'data-symbol-color'?: string;
};

export const SymbolText = styled(Typography)<SymbolTextProps>(({ theme, ...props }) => ({
  color: props['data-symbol-color'] ? props['data-symbol-color'] : theme.palette.color.base1300,
}));
