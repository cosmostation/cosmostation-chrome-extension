import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  alignItems: 'center',
});

export const ChainNameContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const OriginContainer = styled('div')(({ theme }) => ({
  marginTop: '0.4rem',

  padding: '0.4rem 1rem',

  color: theme.colors.text02,

  border: `0.1rem solid ${theme.colors.base04}`,

  borderRadius: '5rem',
}));
