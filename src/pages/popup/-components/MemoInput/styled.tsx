import { styled } from '@mui/material/styles';

import IconButton from '@/components/common/IconButton';

export const Container = styled('div')({
  width: '100%',
  padding: '1.2rem 1.6rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxSizing: 'border-box',
});

export const LeftContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.4rem',
});

export const RightContainer = styled('div')({});

export const StyledIconButton = styled(IconButton)({
  width: '2.4rem',
  height: '2.4rem',

  '& > svg': {
    width: '2.4rem',
    height: '2.4rem',
  },
});
