import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  'data-opacity'?: number;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ ...props }) => ({
  border: 0,

  width: 'fit-content',
  height: 'fit-content',

  display: 'flex',
  alignItems: 'center',

  background: 'none',

  cursor: 'pointer',

  padding: '0',

  opacity: props['data-opacity'] ?? 1,

  '&:hover': {
    opacity: 0.7,
  },
}));
