import { styled } from '@mui/material/styles';

export const StyledDivider = styled('hr')(({ theme }) => ({
  margin: 0,
  border: `0.05rem solid ${theme.colors.base03}`,
}));
