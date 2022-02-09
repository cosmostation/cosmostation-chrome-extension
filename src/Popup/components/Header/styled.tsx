import { styled } from '@mui/material/styles';

import BaseChainButton from './ChainButton';
import BaseNetworkButton from './NetworkButton';

export const Container = styled('div')(({ theme }) => ({
  width: '36rem',
  height: '4.8rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  backgroundColor: theme.colors.base01,
}));

export const LeftContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  paddingLeft: '1.2rem',
});

export const RightContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',

  paddingRight: '1rem',
});

export const NetworkButton = styled(BaseNetworkButton)({
  marginRight: '0.8rem',
});

export const ChainButton = styled(BaseChainButton)({
  marginRight: '0.8rem',
});
