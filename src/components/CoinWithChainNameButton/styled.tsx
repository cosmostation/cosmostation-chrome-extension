import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ContentsContainer = styled('div')({
  paddingLeft: '1rem',

  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.3rem',
});

export const SymbolTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const ChainNameTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const APRTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

type APRTextProps = {
  'data-is-high-apr'?: boolean;
};

export const APRText = styled('div')<APRTextProps>(({ theme, ...props }) => ({
  color: props['data-is-high-apr'] ? theme.palette.accentColor.green400 : theme.palette.color.base1000,
}));
