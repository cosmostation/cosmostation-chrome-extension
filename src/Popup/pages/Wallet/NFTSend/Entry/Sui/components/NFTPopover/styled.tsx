import { styled } from '@mui/material/styles';

import Popover from '~/Popup/components/common/Popover';

export const StyledPopover = styled(Popover)({
  '& .MuiPaper-root': {
    marginTop: '0.8rem',

    '& > div': {
      width: '32.6rem',
      maxHeight: '32rem',
    },
  },
});

export const Container = styled('div')({
  padding: '1.6rem 1.2rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
  overflow: 'auto',
});
