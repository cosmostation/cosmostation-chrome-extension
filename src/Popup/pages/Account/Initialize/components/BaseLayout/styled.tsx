import { styled } from '@mui/material/styles';

export const Body = styled('div')(({ theme }) => ({
  width: '42rem',
  height: '60rem',

  backgroundColor: theme.colors.base01,

  borderRadius: '2rem',

  overflow: 'hidden',
}));

type ContainerProps = {
  'data-height': string;
};

export const Container = styled('div')<ContainerProps>(({ ...props }) => ({
  width: '100%',
  height: props['data-height'],

  overflow: 'hidden',
}));
