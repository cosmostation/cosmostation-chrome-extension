import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '2.1rem 1.6rem 1.6rem 1.6rem',
});

export const StyledInput = styled(Input)({
  height: '4rem',
});

export const StyledButton = styled(Button)({
  marginTop: '6rem',
  height: '4rem',
});
