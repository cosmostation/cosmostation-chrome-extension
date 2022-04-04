import { styled } from '@mui/material/styles';

import ChainPopover from '~/Popup/components/ChainPopover';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.4rem 1.6rem 0 1.6rem',
  position: 'relative',
});

export const InputContainer = styled('div')({
  marginTop: '1.6rem',
});

export const StyledInput = styled(Input)({
  height: '4.8rem',
});

export const StyledTextarea = styled(Input)({});

export const MarginTop8Container = styled('div')({
  marginTop: '0.8rem',
});

export const ButtonContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const StyledChainPopover = styled(ChainPopover)({
  '& .MuiPaper-root > div': {
    width: '32.8rem',
    maxHeight: '43.5rem',
  },
});
