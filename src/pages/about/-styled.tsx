import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const StyledBox = styled(Box)(({ theme }) => {
  return {
    backgroundColor: theme.palette.color.base50,
  };
});

export const Container = styled('div')(({ theme }) => {
  return {
    color: theme.palette.color.base700,
  };
});
