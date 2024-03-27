import { styled } from '@mui/material/styles';

export const WarningContainer = styled('div')(({ theme }) => ({
  padding: '2.4rem',
  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',
}));

export const WarningContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100%',
});

export const WarningTextContainer = styled('div')(({ theme }) => ({
  width: '20rem',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.8rem',
  textAlign: 'center',
  color: theme.colors.text01,
}));
