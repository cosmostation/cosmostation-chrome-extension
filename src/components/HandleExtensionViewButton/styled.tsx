import { styled } from '@mui/material/styles';

import IconButton from '../common/IconButton';

export const StyledIconButton = styled(IconButton)({
  width: '100%',
  height: '100%',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});
