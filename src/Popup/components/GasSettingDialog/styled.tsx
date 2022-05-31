import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '2.1rem 1.6rem 1.6rem 1.6rem',
});

export const InputContainer = styled('div')({
  width: '100%',
});

export const StyledInput = styled(Input)({
  height: '4rem',
  width: '100%',
});

export const StyledButton = styled(Button)({
  marginTop: '2.4rem',
  height: '4rem',
});
