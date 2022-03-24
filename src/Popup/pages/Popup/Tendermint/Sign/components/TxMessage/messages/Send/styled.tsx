import { styled } from '@mui/material/styles';

export const ContentContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}));

export const FeeInfoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

export const LeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const RightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const RightColumnContainer = styled('div')({});

export const RightAmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text01,
}));

export const RightValueContainer = styled('div')(({ theme }) => ({
  marginTop: '0.2rem',

  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text02,
}));
