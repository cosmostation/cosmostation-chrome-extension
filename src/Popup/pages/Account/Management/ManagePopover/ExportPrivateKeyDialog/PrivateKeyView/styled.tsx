import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '2.1rem 1.6rem 1.6rem 1.6rem',
});

export const StyledInput = styled(Input)({});

export const StyledButton = styled(Button)({
  marginTop: '2.9rem',
  height: '4rem',
});
