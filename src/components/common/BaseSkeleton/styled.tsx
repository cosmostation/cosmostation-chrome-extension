import { Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledSkeleton = styled(Skeleton)({
  '&.MuiSkeleton-root': {
    '&.MuiSkeleton-wave': {
      background: 'linear-gradient(90deg, #353B48 0%, #2D323D 100%)',
      '&::after': {
        background: 'linear-gradient(90deg, transparent, #353B48, transparent);',
      },
    },
  },
});
