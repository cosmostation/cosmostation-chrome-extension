import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

import IconButton from '../common/IconButton';
import OutlinedInput from '../common/OutlinedInput';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '0.6rem',
});

export const StyledInput = styled(OutlinedInput)({
  height: '3.2rem',
  paddingLeft: '0.8rem',
});

export const FilterIconButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',

  width: '3.2rem',
  height: '3.2rem',

  borderRadius: '0.4rem',

  border: `0.1rem solid ${theme.palette.color.base200}`,
  backgroundColor: theme.palette.color.base100,
  '&:hover': {
    backgroundColor: theme.palette.color.base200,
    opacity: '1',
  },
}));

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '&.MuiCircularProgress-root': {
    color: theme.palette.color.base1300,
  },
}));
