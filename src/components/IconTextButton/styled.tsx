import { styled } from '@mui/material/styles';

type SideTextButtonProps = {
  direction?: 'horizontal' | 'vertical';
};

export const SideTextButton = styled('button')<SideTextButtonProps>(({ ...props }) => ({
  border: 0,

  width: 'fit-content',
  height: 'fit-content',

  display: 'flex',
  flexDirection: props.direction === 'vertical' ? 'column' : 'row',
  alignItems: 'center',

  background: 'none',

  cursor: 'pointer',

  padding: '0',

  '&:hover': {
    opacity: 0.7,
  },
}));
