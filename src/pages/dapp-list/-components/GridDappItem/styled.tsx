import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';
import SkeletonImage from '@/components/common/SkeletonImage';

export const StyledButton = styled('button')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  border: 'none',
  padding: '0',

  rowGap: '1rem',

  backgroundColor: 'transparent',
  position: 'relative',

  '&:hover': {
    opacity: '0.8',
  },

  cursor: 'pointer',
});

export const ThumbnailImageWrapper = styled('div')({
  width: '100%',
});

export const ThumbnailImageContainer = styled(SkeletonImage)({
  borderRadius: '0.4rem',
  position: 'relative',
  aspectRatio: '4 / 3',
  maxWidth: '100%',
  height: 'auto',
});

export const BodyContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.4rem',
});

export const BodyTopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  width: '100%',
});

export const DappNameContainer = styled('div')({
  display: 'flex',

  maxWidth: '75%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const BodyText = styled(Typography)(({ theme }) => ({
  maxWidth: '90%',
  textAlign: 'left',
  wordBreak: 'break-word',
  color: theme.palette.color.base900,

  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  marginBottom: '0.2rem',
  height: '3.2rem',
}));

export const OneChainContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  columnGap: '0.2rem',
});

export const MultipleChainContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ChainImageContainer = styled(BaseChainImage)({
  width: '1.6rem',
  height: '1.6rem',
});

export const PinButton = styled('button')({
  width: '1.6rem',
  height: '1.6rem',
  padding: '0',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',

  '&:hover': {
    opacity: '0.8',
  },
});

export const PinnedIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',
  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.accentColor.yellow300,

    '& > path': {
      fill: theme.palette.accentColor.yellow300,
    },
  },
}));

export const Badge = styled('div')({
  position: 'absolute',
  top: '0.8rem',
  right: '0.8rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.2rem 0.5rem',

  border: `0.08rem solid rgba(247, 247, 248, 0.04)`,
  borderRadius: '0.2rem',
  backdropFilter: 'blur(0.3rem)',

  backgroundColor: 'rgba(0, 0, 0, 0.25)',
});
