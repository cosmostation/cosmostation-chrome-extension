import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ChangeAddressIconButtonContainer = styled('div')({
  marginLeft: '0.4rem',
});

export const IconDivider = styled('div')(({ theme }) => ({
  height: '0.8rem',
  width: '0.1rem',
  borderRight: `0.1rem solid ${theme.palette.color.base600}`,
  marginLeft: '0.4rem',
}));
