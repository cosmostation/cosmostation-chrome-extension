import { styled } from '@mui/material/styles';

import LedgerConnect50Icon from '~/images/icons/LedgerConnect50.svg';
import LedgerWarning50Icon from '~/images/icons/LedgerWarning50.svg';

export const Container = styled('div')(({ theme }) => ({
  marginTop: '1.6rem',

  width: '100%',

  padding: '2.4rem 0',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',
}));

export const LedgerConnectIcon = styled(LedgerConnect50Icon)(({ theme }) => ({
  '& > circle': {
    stroke: theme.colors.base05,
  },

  '& > nth-of-type(1), & > nth-of-type(2), & > nth-of-type(3)': {
    stroke: theme.colors.base05,
  },
}));

export const LedgerWarningIcon = styled(LedgerWarning50Icon)(({ theme }) => ({
  '& > circle': {
    stroke: theme.colors.base05,
  },

  '& > nth-of-type(1), & > nth-of-type(2), & > nth-of-type(3)': {
    stroke: theme.colors.base05,
  },
}));

export const ButtonContainer = styled('div')({
  width: '14.8rem',
});

export const TextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  width: '23rem',
  textAlign: 'center',
}));
