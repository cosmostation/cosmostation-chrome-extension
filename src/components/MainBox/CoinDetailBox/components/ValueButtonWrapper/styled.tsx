import { styled } from '@mui/material/styles';

import IconButton from '@/components/common/IconButton';

export const Container = styled('div')({
  display: 'flex',
});

type ValueButtonProps = {
  'data-is-hovering'?: boolean;
};

export const ValueButton = styled('button')<ValueButtonProps>(({ theme, ...props }) => ({
  backgroundColor: 'transparent',
  padding: 0,
  margin: 0,
  border: 0,

  cursor: 'pointer',

  color: theme.palette.color.base1300,
  opacity: props['data-is-hovering'] ? 0.7 : 1,

  '&:hover': {
    opacity: 0.7,
  },
}));

export const StyledIconButton = styled(IconButton)({
  height: '3rem',
  width: '4rem',
  display: 'flex',
  justifyContent: 'flex-end',
});
