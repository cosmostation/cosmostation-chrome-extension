import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const StyledBox = styled(Box)(({ theme }) => {
  return {
    backgroundColor: theme.palette.color.base1100,
  };
});

export const ContainerA = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.color.base100,
}));

export const ContainerB = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.color.base200,
}));

export const ContainerC = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.color.base300,
}));
