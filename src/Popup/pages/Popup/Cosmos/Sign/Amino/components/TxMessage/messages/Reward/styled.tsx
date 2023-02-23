import { styled } from '@mui/material/styles';

export const ContentContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  margin: '0 -1.6rem',
  padding: '1.2rem 1.6rem 0',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  overflow: 'auto',
}));

export const AddressContainer = styled('div')({});

export const LabelContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const ValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  marginTop: '0.4rem',
}));
