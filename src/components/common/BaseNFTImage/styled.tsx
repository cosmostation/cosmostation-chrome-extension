import { styled } from '@mui/material/styles';

import SkeletonImage from '../SkeletonImage';

export const StyledSkeletonImage = styled(SkeletonImage)({
  aspectRatio: '1 / 1',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '0.4rem',

  '& > img': {
    borderRadius: '0.4rem',

    width: '100%',
    height: '100%',
  },
});
