import { Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
  '&.MuiSkeleton-root': {
    backgroundColor: theme.colors.base05,
  },
}));
