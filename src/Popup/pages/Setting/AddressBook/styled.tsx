import { styled } from '@mui/material/styles';

import ChainButton from '~/Popup/components/ChainButton';
import ChainPopover from '~/Popup/components/ChainPopover';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',
});

export const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const StyledChainButton = styled(ChainButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  border: `0.1rem solid ${theme.colors.base04}`,
}));

export const StyledChainPopover = styled(ChainPopover)({
  '& .MuiPaper-root > div': {
    width: '32.8rem',
  },
});
