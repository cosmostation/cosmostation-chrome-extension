import { styled } from '@mui/material/styles';

import OutlinedInput from '../../../common/OutlinedInput';
import TextButton from '../../../common/TextButton';

import backgroungImg from '@/assets/images/backgroundImage/background.png';

export const FormContainer = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '1.2rem',

  boxSizing: 'border-box',

  backgroundImage: `url(${backgroungImg})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundColor: theme.palette.common.black,
  position: 'relative',
}));

export const StyledInputContainer = styled('div')({
  position: 'absolute',
  height: '7.5rem',
  top: '60%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'calc(100% - 2.4rem)',
});

export const StyledInput = styled(OutlinedInput)(({ theme }) => ({
  height: '5.2rem',

  '.MuiOutlinedInput-input': {
    '&::placeholder': {
      fontFamily: theme.typography.b1_R.fontFamily,
      fontStyle: theme.typography.b1_R.fontStyle,
      fontSize: theme.typography.b1_R.fontSize,
      lineHeight: theme.typography.b1_R.lineHeight,
      letterSpacing: theme.typography.b1_R.letterSpacing,
    },
  },
}));

export const RecoverPasswordTextButton = styled(TextButton)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',

  marginBottom: '1.6rem',

  color: theme.palette.color.base1000,
}));
