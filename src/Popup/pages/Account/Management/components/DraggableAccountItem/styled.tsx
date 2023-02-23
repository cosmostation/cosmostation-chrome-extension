import { styled } from '@mui/material/styles';

type ContainerProps = {
  'data-is-dragging': boolean;
};

export const Container = styled('div')<ContainerProps>(({ theme, ...props }) => ({
  backgroundColor: theme.colors.base02,

  padding: '0 0.8rem 0 1.6rem',

  width: '100%',
  height: '4.8rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  borderRadius: '0.8rem',

  border: 0,

  opacity: props['data-is-dragging'] ? 0 : 0.999,

  cursor: 'move',
}));

export const LeftContainer = styled('div')({});

export const LeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const RightContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.colors.base05,
  },
}));
