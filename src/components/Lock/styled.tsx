import { styled } from '@mui/material/styles';

import OutlinedInput from '../common/OutlinedInput';
import TextButton from '../common/TextButton';

export const FormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '1.2rem',

  boxSizing: 'border-box',
});

export const StyledInput = styled(OutlinedInput)({
  height: '3.2rem',
});

export const RecoverPasswordTextButton = styled(TextButton)({});
