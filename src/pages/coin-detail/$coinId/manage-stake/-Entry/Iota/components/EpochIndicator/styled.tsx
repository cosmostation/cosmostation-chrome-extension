import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.9rem 1.2rem',
});

export const EpochContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: '0.4rem',
  padding: '0.8rem 1.2rem',
  backgroundColor: theme.palette.color.base100,
  borderRadius: '0.4rem',
}));

export const DistributionCountContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  rowGap: '0.4rem',
});
