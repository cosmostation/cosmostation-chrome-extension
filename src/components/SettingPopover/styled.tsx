import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import IconTextButton from '../IconTextButton';
import Popover from '../Popover';

export const StyledPopover = styled(Popover)({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledIconTextButton = styled(IconTextButton)(({ theme }) => ({
  width: '14.2rem',
  padding: '0.8rem 1.2rem',

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const StyledTypography = styled(Typography)(({ theme }) => ({
  marginLeft: '0.4rem',

  color: theme.palette.color.base1300,
}));
