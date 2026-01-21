import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Button from '../../common/Button';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const LeftContentContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.4rem',
});

export const NetworkFeeText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const FeeCustomButton = styled('button')(({ theme }) => ({
  display: 'flex',

  backgroundColor: 'transparent',

  padding: '0',

  border: 'none',

  color: theme.palette.color.base1300,

  cursor: 'pointer',

  '&:hover': {
    opacity: '0.8',
  },
}));

export const EstimatedFeeTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',

  borderBottom: `0.1rem solid ${theme.palette.color.base1300}`,
}));

export const RightContentContainer = styled('div')({
  width: '40%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

export const StyledButton = styled(Button)({
  padding: '1.5rem 3rem',
});
