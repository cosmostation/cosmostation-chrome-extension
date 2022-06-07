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

export const LabelContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  marginBottom: '0.8rem',
});

export const LabelText = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.colors.text02,
}));

export const LabelButton = styled('button')(({ theme }) => ({
  padding: 0,
  border: 0,

  background: 'inherit',

  display: 'flex',
  alignItems: 'center',

  marginLeft: '0.4rem',

  '& > svg': {
    fill: theme.colors.text02,
  },
}));
