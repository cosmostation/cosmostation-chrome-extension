import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  variants?: 'normal' | 'hyperlink' | 'underline' | 'redHyperlink';
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  border: 'none',

  backgroundColor: 'transparent',
  color:
    props['variants'] === 'normal' || props['variants'] === 'underline'
      ? theme.palette.color.base1300
      : props['variants'] === 'redHyperlink'
        ? theme.palette.accentColor.red400
        : theme.palette.accentColor.purple400,

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
