import { styled } from '@mui/material/styles';

type StyledIconButtonProps = {
  direction?: 'horizontal' | 'vertical';
};

export const StyledIconButton = styled('button')<StyledIconButtonProps>(({ ...props }) => ({
  border: 0,

  width: 'fit-content',
  height: 'fit-content',

  display: 'flex',
  flexDirection: props.direction === 'vertical' ? 'column' : 'row',
  alignItems: 'center',

  background: 'none',

  cursor: 'pointer',
  '&:disabled': {
    cursor: 'default',
  },

  padding: '0',

  '&:hover': {
    opacity: 0.7,
    '&:disabled': {
      opacity: 1,
    },
  },
}));
