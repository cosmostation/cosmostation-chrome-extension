import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';
import BaseNFTImage from '@/components/common/BaseNFTImage';

export const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',
  position: 'relative',

  border: 0,
  backgroundColor: 'transparent',

  padding: '0.8rem',

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

  '&:hover': {
    backgroundColor: theme.palette.color.base100,
  },
}));

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
