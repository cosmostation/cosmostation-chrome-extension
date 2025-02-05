import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  rowGap: '1.2rem',
  boxSizing: 'border-box',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

export const DateLineContainer = styled('div')({
  marginBottom: '0.6rem',
});

export const TxDetailContainer = styled('div')({});

export const StyledCircularProgressContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
});

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '&.MuiCircularProgress-root': {
    color: theme.palette.accentColor.purple200,
  },
}));

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const TitleContainer = styled('div')({
  display: 'flex',

  maxWidth: '10rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
