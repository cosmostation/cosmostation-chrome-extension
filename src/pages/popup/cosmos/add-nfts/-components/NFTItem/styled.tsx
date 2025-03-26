import { styled } from '@mui/material/styles';

import AbsoluteLoading from '@/components/common/AbsoluteLoading';

export const Container = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  position: 'relative',
});

export const NFTImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '60%',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '0.4rem',

  '& > img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

export const NFTNameTextContainer = styled('div')({
  display: 'flex',
  maxWidth: '70%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  margin: '1.2rem 0 0.4rem',
});

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.4rem',
});
