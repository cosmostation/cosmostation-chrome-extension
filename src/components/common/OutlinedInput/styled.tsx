import { OutlinedInput } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledTextField = styled(OutlinedInput)(({ theme, ...props }) => ({
  borderRadius: '0.4rem',

  backgroundColor: theme.palette.color.base100,
  color: theme.palette.color.base1300,

  width: '100%',

  '&.MuiOutlinedInput-root': {
    backgroundColor: theme.palette.color.base100,
  },

  '.MuiOutlinedInput-input': {
    fontFamily: theme.typography.b2_M.fontFamily,
    fontStyle: theme.typography.b2_M.fontStyle,
    fontSize: theme.typography.b2_M.fontSize,
    lineHeight: theme.typography.b2_M.lineHeight,
    letterSpacing: theme.typography.b2_M.letterSpacing,

    WebkitTextSecurity: props.type === 'password' ? 'disc' : 'none',
    MoxTextSecurity: props.type === 'password' ? 'disc' : 'none',

    '&[type=password]': {
      letterSpacing: '0.3rem',
    },

    '&::placeholder': {
      fontFamily: theme.typography.b2_M.fontFamily,
      fontStyle: theme.typography.b2_M.fontStyle,
      fontSize: theme.typography.b2_M.fontSize,
      lineHeight: theme.typography.b2_M.lineHeight,
      letterSpacing: theme.typography.b2_M.letterSpacing,

      color: theme.palette.color.base700,
    },
  },

  '.MuiOutlinedInput-notchedOutline': {
    border: `0.1rem solid ${theme.palette.color.base200}`,
  },

  '&:hover': {
    '.MuiOutlinedInput-notchedOutline': {
      border: '0.1rem solid #9C6CFF',
    },
  },
  '&.Mui-focused': {
    '.MuiOutlinedInput-notchedOutline': {
      border: '0.1rem solid #9C6CFF',
    },
  },
}));
