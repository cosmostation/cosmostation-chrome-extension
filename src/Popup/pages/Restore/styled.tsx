import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  width: 'calc(100% - 2.4rem)',
  height: 'calc(100% - 0.8rem)',

  padding: '0.8rem 1.2rem 0',

  position: 'relative',
});

export const InputContainer = styled('div')({
  '& > :nth-of-type(n + 2)': {
    marginTop: '0.8rem',
  },
});

export const StyledInput48 = styled(Input)({
  height: '4.8rem',
});

export const StyledInput140 = styled(Input)({
  minHeight: '14rem',
});

export const ButtonContainer = styled('div')({
  height: '4.8rem',
  position: 'absolute',

  width: 'calc(100% - 2.4rem)',

  bottom: '1.6rem',
});
