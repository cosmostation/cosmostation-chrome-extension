import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  alignItems: 'center',
  justifyContent: 'center',
});

export const TextWrapper = styled('div')(() => ({
  width: '70%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: '0.8rem',
  marginTop: '2rem',
}));

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '&.MuiCircularProgress-root': {
    color: theme.palette.accentColor.purple200,
  },
}));
