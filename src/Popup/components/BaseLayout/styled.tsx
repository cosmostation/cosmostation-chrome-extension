import { styled } from '@mui/material/styles';

export const Body = styled('div')({
  width: '100%',
  height: '100%',
});

type ContainerProps = {
  'data-height': string;
};

export const Container = styled('div')<ContainerProps>(({ theme, ...props }) => ({
  width: '36rem',

  height: props['data-height'],

  backgroundColor: theme.colors.base01,

  overflow: 'hidden',
}));
