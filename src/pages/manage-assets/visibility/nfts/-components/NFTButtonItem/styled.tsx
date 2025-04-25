import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';
import BaseNFTImage from '@/components/common/BaseNFTImage';
import BaseSkeleton from '@/components/common/BaseSkeleton';

export const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',
  position: 'relative',

  border: 0,
  backgroundColor: 'transparent',

  padding: '0.8rem 1.6rem 0.8rem 1.2rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  rowGap: '1rem',

  cursor: 'pointer',

  '&:disabled': {
    cursor: 'default',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  '&:hover': {
    backgroundColor: theme.palette.color.base100,
  },
}));

export const LeftContainer = styled('div')({
  width: '80%',
  display: 'flex',
  alignItems: 'center',
  columnGap: '1.2rem',
});

export const LeftContentsContainer = styled('div')({
  maxWidth: '70%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const NFTImageContainer = styled('div')({
  width: '7rem',
  height: '7rem',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '0.8rem',

  '& > img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

export const NFTImageSkeletonContainer = styled(BaseSkeleton)({
  width: '100%',
  height: '100%',
  borderRadius: '0.4rem',
});

export const TextSkeletonContainer = styled(BaseSkeleton)({
  width: '8rem',
  height: '1rem',
  borderRadius: '0.7rem',
});

export const SubTextSkeletonContainer = styled(BaseSkeleton)({
  width: '6rem',
  height: '1rem',
  borderRadius: '0.7rem',
});

export const NFTImage = styled(BaseNFTImage)({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '0.4rem',
  position: 'relative',
});

export const NFTNameTextContainer = styled('div')({
  display: 'flex',
  maxWidth: '70%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',
  marginBottom: '0.4rem',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const NFTSubNameTextContainer = styled('div')({
  display: 'flex',
  maxWidth: '17rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',
  marginBottom: '0.8rem',

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
