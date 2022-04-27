import { styled } from '@mui/material/styles';

import BaseNetworkButton from './NetworkButton';

export const Container = styled('div')({
  width: '100%',
  height: '2.8rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  backgroundColor: 'transparent',
});

export const LeftContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const RightContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

export const NetworkButton = styled(BaseNetworkButton)({
  marginRight: '0.8rem',
});
