import { styled } from '@mui/material/styles';

type StyledCheckBoxButtonProps = {
  isChecked?: boolean;
};

export const StyledCheckBoxButton = styled('button')<StyledCheckBoxButtonProps>(({ theme, ...props }) => ({
  border: 0,

  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '0.2rem',

  cursor: 'pointer',

  padding: '0',

  backgroundColor: props['isChecked'] ? theme.palette.accentColor.purple200 : theme.palette.color.base300,

  '&:hover': {
    opacity: 0.7,
  },

  '& > svg': {
    maxWidth: '60%',
    maxheight: '40%',
  },
}));
