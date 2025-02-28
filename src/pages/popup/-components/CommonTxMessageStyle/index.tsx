import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '0 1.6rem',
});

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
  margin: '1.1rem 0 1.2rem',
}));

export const MsgTitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const AddressContainer = styled('div')({
  display: 'flex',

  maxWidth: '33rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const MsgTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
}));

export const DetailWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1.6rem',
});

export const AmountWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1.2rem',
});

export const LabelContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const AmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  color: theme.palette.color.base1300,
}));

type SymbolTextProps = {
  'data-symbol-color'?: string;
};

export const SymbolText = styled(Typography)<SymbolTextProps>(({ theme, ...props }) => ({
  color: props['data-symbol-color'] ? props['data-symbol-color'] : theme.palette.color.base1300,
}));

export const MemoContainer = styled('div')({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});
