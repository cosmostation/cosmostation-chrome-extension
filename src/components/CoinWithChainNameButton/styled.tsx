import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const ContentsContainer = styled('div')({
  paddingLeft: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',

  flex: 1,
  minWidth: 0,
});

export const SymbolContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.4rem',
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

export const ChainNameContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  flex: 1,
  minWidth: 0,

  maxWidth: '100%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
