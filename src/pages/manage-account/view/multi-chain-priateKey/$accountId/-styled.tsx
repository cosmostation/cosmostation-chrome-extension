import { styled } from '@mui/material/styles';

import BaseSkeleton from '@/components/common/BaseSkeleton';
import OutlinedInput from '@/components/common/OutlinedInput';

export const Body = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const StickyContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
  padding: '0.8rem 0 1.2rem',
  borderBottom: `0.06rem solid ${theme.palette.color.base100}`,
}));

export const StyledInput = styled(OutlinedInput)({
  height: '3.2rem',
});

export const ContentsContainer = styled('div')({
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

export const PrivateAccordionContainer = styled('div')(({ theme }) => ({
  '&:last-child': {
    borderBottom: `0.06rem solid ${theme.palette.color.base100}`,
  },
}));

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0',
});

export const SkeletonContainer = styled('div')({
  width: '100%',
  height: '6rem',
  backgroundColor: 'transparent',

  padding: '0.8rem 1.6rem 0.8rem 1.2rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  rowGap: '1rem',
});

export const LeftContainer = styled('div')({
  width: '80%',
  display: 'flex',
  alignItems: 'center',
  columnGap: '1.2rem',
});

export const LeftContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.4rem',
  height: '100%',
});

export const ImageSkeletonContainer = styled(BaseSkeleton)({
  width: '3.6rem',
  height: '3.6rem',
});

export const TextSkeletonContainer = styled(BaseSkeleton)({
  width: '8rem',
  height: '1rem',
  borderRadius: '0.7rem',
});

export const SubTextSkeletonContainer = styled(BaseSkeleton)({
  width: '14rem',
  height: '1rem',
  borderRadius: '0.7rem',
});
