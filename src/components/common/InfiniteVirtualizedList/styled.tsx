import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledCircularProgressContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
});

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '&.MuiCircularProgress-root': {
    color: theme.palette.accentColor.purple200,
  },
}));
