import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',

  backgroundColor: theme.palette.color.base100,

  boxSizing: 'border-box',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.3rem 1.6rem',
}));

export const LeftContentContainer = styled('div')({});

export const RightContentContainer = styled('div')({
  marginLeft: 'auto',
});
