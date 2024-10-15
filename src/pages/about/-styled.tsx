import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const StyledBox = styled(Box)(({ theme }) => {
  return {
    backgroundColor: theme.palette.color.test1,
  };
});
