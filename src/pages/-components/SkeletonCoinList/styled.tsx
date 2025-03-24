import { styled } from '@mui/material/styles';

import BaseSkeleton from '@/components/common/BaseSkeleton';

export const Container = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.4rem 1.6rem',
  boxSizing: 'border-box',
});

export const LeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  columnGap: '1rem',
});

export const LeftTextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  rowGap: '0.8rem',
});

export const RightContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  rowGap: '0.8rem',
});

export const CircleSkeletonContainer = styled(BaseSkeleton)({
  width: '3.2rem',
  height: '3.2rem',
});

export const TextSkeletonContainer = styled(BaseSkeleton)({
  width: '8rem',
  height: '1rem',
  borderRadius: '0.7rem',
});

export const SmallTextSkeletonContainer = styled(BaseSkeleton)({
  width: '6rem',
  height: '1rem',
  borderRadius: '0.7rem',
});
