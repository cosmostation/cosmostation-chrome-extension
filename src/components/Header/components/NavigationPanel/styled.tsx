import { styled } from '@mui/material/styles';

import IconButton from '@/components/common/IconButton';

export const LeftNavigatorContainer = styled('div')({
  width: '100%',
  height: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  columnGap: '0.8rem',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  '& > svg > path': {
    fill: theme.palette.color.base1300,
  },
  '&:disabled': {
    '& > svg > path': {
      fill: theme.palette.color.base600,
    },
  },
}));
