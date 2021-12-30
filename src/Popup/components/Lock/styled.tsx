import BaseButton from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import BaseTextField from '@mui/material/TextField';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  color: theme.colors.backgroundColor,
}));

export const Button = styled(BaseButton)({});

export const TextField = styled(BaseTextField)({});
