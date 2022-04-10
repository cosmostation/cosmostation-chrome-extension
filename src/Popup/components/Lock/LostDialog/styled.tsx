import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '0.3rem 1.9rem 3rem 1.9rem',
});

export const WarningImageContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const WarningTitleContainer = styled('div')(({ theme }) => ({
  marginTop: '0.8rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  color: theme.colors.text01,
}));

export const WarningDescriptionContainer = styled('div')(({ theme }) => ({
  marginTop: '0.4rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  textAlign: 'center',

  color: theme.colors.text02,

  wordBreak: 'break-word',
}));
