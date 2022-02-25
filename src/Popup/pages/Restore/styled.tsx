import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  position: 'relative',
});

export const InputContainer = styled('div')({
  // TODO: grid 로 변경
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

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});
