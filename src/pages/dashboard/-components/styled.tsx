import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.baseColor.base100,
  color: theme.baseColor.base200,
}));
