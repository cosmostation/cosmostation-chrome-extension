import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';
import Divider from '~/Popup/components/common/Divider';
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

export const CurrentInfoContainer = styled('div')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginTop: '0.8rem',
  padding: '0.4rem 0',

  color: theme.colors.text01,
  backgroundColor: theme.colors.base03,

  borderRadius: '0.5rem',
}));

export const StyledDivider = styled(Divider)({
  margin: '2rem 0',
});
