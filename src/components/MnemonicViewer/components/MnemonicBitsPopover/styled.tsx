import { styled } from '@mui/material/styles';

import IconTextButton from '@/components/common/IconTextButton';
import Popover from '@/components/common/Popover';

export const StyledPopover = styled(Popover)({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledIconTextButton = styled(IconTextButton)(({ theme }) => ({
  width: 'fit-content',
  padding: '0.8rem 1.2rem',

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));
