import { styled } from '@mui/material/styles';

export const Body = styled('div')(({ theme }) => ({
  width: '36rem',
  height: '60rem',

  backgroundColor: theme.colors.base01,

  overflow: 'hidden',
}));

type ContainerProps = {
  'data-height': string;
};

export const Container = styled('div')<ContainerProps>((props) => ({
  height: props['data-height'],

  overflow: 'hidden',
}));
