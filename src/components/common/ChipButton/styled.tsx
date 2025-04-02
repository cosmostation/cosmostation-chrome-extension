import { styled } from '@mui/material/styles';

import { theme } from '@/styles/theme';

type StyledChipButtonProps = {
  variants?: 'light' | 'dark';
};

export const StyledChipButton = styled('button')<StyledChipButtonProps>(({ ...props }) => ({
  border: 0,

  minWidth: '5.6rem',
  height: 'fit-content',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  background: 'none',
  backgroundColor: props.variants === 'light' ? 'white' : theme.palette.color.base300,

  borderRadius: '1.9rem',

  color: props.variants === 'light' ? 'black' : theme.palette.color.base1300,

  boxShadow: props.variants === 'light' ? 'none' : '0.2px 0.4px 1px 0px rgba(118, 118, 118, 0.25) inset',

  cursor: 'pointer',

  padding: '0.5rem 0',

  '&:hover': {
    opacity: 0.7,
  },
}));
