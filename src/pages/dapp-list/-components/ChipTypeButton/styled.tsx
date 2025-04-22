import { styled } from '@mui/material/styles';

import { theme } from '@/styles/theme';

type StyledChipButtonProps = {
  'data-is-active'?: boolean;
};

export const StyledChipButton = styled('button')<StyledChipButtonProps>(({ ...props }) => ({
  border: 0,
  flexShrink: '0',

  width: 'fit-content',
  height: 'fit-content',

  boxSizing: 'border-box',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  background: 'none',
  backgroundColor: props['data-is-active'] ? theme.palette.color.base400 : 'transparent',

  borderRadius: '1.9rem',

  color: props['data-is-active'] ? theme.palette.color.base1300 : theme.palette.color.base600,

  cursor: 'pointer',

  padding: '0.4rem 0.8rem',

  '&:hover': {
    opacity: 0.7,
  },

  '& * > svg': {
    width: '100%',
    height: '100%',
    fill: props['data-is-active'] ? theme.palette.color.base1300 : theme.palette.color.base600,
    '& > path': {
      fill: props['data-is-active'] ? theme.palette.color.base1300 : theme.palette.color.base600,
    },
  },
}));
