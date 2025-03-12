import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';

export const StyledButton = styled('button')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  border: 'none',
  padding: '0',

  rowGap: '1rem',

  '&:hover': {
    opacity: '0.8',
  },

  cursor: 'pointer',
});

export const BodyContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.4rem',
});

export const BodyTopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  maxWidth: '100%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

// export const TitleEllipsisContainer = styled('div')({
//   display: 'flex',

//   maxWidth: '27rem',
//   wordBreak: 'keep-all',
//   whiteSpace: 'nowrap',

//   '& > *': {
//     overflow: 'hidden',
//     textOverflow: 'ellipsis',
//   },
// });

export const BodyText = styled(Typography)(({ theme }) => ({
  wordBreak: 'break-word',
  color: theme.palette.color.base1000,

  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  overflow: 'hidden',
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
  width: '1.2rem',
  height: '1.2rem',
});

export const PinButton = styled('button')({
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
