import type { SkeletonProps } from '@mui/material';

import { StyledSkeleton } from './styled';

export default function BaseSkeleton({ ...remainder }: SkeletonProps) {
  return <StyledSkeleton animation="wave" {...remainder} />;
}
