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

export const TitleAreaContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '1.6rem',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const DescriptionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  wordBreak: 'break-word',

  textAlign: 'center',

  color: theme.colors.text02,

  '& > *': {
    width: '26.1rem',
  },
}));
