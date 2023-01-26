import { styled } from '@mui/material/styles';

export const ContentContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  paddingTop: '1.2rem',

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
