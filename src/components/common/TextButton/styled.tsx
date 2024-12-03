import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  variants?: 'normal' | 'hyperlink' | 'underline';
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  border: 'none',

  backgroundColor: 'transparent',
  color: props['variants'] === 'normal' || props['variants'] === 'underline' ? theme.palette.color.base1300 : 'purple',

  textDecorationLine: props['variants'] === 'normal' ? 'none' : 'underline',
  textDecorationSkipInk: 'none',

  cursor: 'pointer',

  padding: 0,

  '&:hover': {
    opacity: 0.8,
  },

  '&:disabled': {
    color: theme.palette.color.base1200,

    cursor: 'default',
  },
}));
