import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  rowGap: '0.8rem',
});

export const TextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  rowGap: '0.4rem',
});

export const HeaderTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

type SubHeaderTextContainerProps = {
  'data-width': string;
};

export const SubHeaderTextContainer = styled('div')<SubHeaderTextContainerProps>(({ theme, ...props }) => ({
  width: `${props['data-width']}rem`,

  textAlign: 'center',
  wordBreak: 'keep-all',

  color: theme.colors.text02,
}));
