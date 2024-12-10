import { styled } from '@mui/material/styles';

export const StyledCheckBoxTextButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  width: 'fit-content',
  height: 'fit-content',

  cursor: 'pointer',

  padding: '0',
  border: 'none',
  background: 'none',

  color: theme.palette.color.base1000,

  '&:hover': {
    opacity: '0.8',
  },
}));

type StyledCheckBoxProps = {
  isChecked: boolean;
};

export const StyledCheckBox = styled('div')<StyledCheckBoxProps>(({ theme, ...props }) => ({
  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: props['isChecked'] ? theme.palette.accentColor.purple200 : theme.palette.color.base300,

  borderRadius: '0.2rem',

  cursor: 'pointer',

  '&:hover': {
    opacity: 0.7,
  },

  '& > svg': {
    maxWidth: '60%',
    maxheight: '40%',
  },
}));
