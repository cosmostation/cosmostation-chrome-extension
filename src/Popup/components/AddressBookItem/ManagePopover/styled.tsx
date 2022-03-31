import { styled } from '@mui/material/styles';

import Popover from '~/Popup/components/common/Popover';

export const Container = styled('div')({
  width: 'max-content',
  height: 'max-content',

  padding: '0.4rem',

  '& > :nth-of-type(n + 2)': {
    marginTop: '0.2rem',
  },
});

export const StyledPopover = styled(Popover)({
  '& .MuiPaper-root': {
    marginTop: '0.3rem',
  },
});
