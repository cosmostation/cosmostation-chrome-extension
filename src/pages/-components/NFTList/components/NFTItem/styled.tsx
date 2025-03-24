import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';
import BaseNFTImage from '@/components/common/BaseNFTImage';
import BaseSkeleton from '@/components/common/BaseSkeleton';

export const StyledButton = styled('button')({
  flex: 1,
  width: '100%',
  height: '100%',
  position: 'relative',

  padding: '0',
  border: 0,
  backgroundColor: 'transparent',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',

  rowGap: '1rem',

  borderRadius: '0.8rem',

  cursor: 'pointer',

  '&:disabled': {
    cursor: 'default',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
});

export const BodyContainer = styled('div')({});

export const BottomContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',

  rowGap: '0.2rem',
});

export const NFTImageContainer = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '0.8rem',

  '& > img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  '&:disabled': {
    cursor: 'default',
    '&:hover': {
      opacity: 1,
    },
  },

  '&:hover': {
    opacity: 0.8,
  },
});

export const NFTImage = styled(BaseNFTImage)({});

export const NFTNameTextContainer = styled('div')({
  display: 'flex',
  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const ChainContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  columnGap: '0.2rem',
});

export const ChainImage = styled(BaseChainImage)({
  width: '1.6rem',
  height: '1.6rem',
});

export const BlurredImage = styled('div')(({ theme }) => ({
  position: 'absolute',
  zIndex: 1,

  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: 'rgba(0, 0, 0, 0.6)',

  backdropFilter: 'blur(0.1rem)',

  color: theme.palette.common.white,
}));

export const NFTImageSkeletonContainer = styled(BaseSkeleton)({
  width: '100%',
  height: '100%',
  borderRadius: '0.4rem',
});

export const ChainImageSkeletonContainer = styled(BaseSkeleton)({
  width: '1.6rem',
  height: '1.6rem',
  borderRadius: '50%',
});

export const ChainSkeletonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  columnGap: '0.6rem',
});

export const TextSkeletonContainer = styled(BaseSkeleton)({
  width: '8rem',
  height: '1rem',
  borderRadius: '0.7rem',
});
