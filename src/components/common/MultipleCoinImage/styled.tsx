import { styled } from '@mui/material/styles';

import Image from '../Image';

export const ImageContainer = styled('div')({
  position: 'relative',

  zIndex: 0,
  '& > img': {
    width: '100%',
    height: '100%',
  },
});

export const MultipleImage = styled(Image)({
  position: 'absolute',

  filter: 'drop-shadow(-0.1rem 0.1rem 0.1rem rgba(0, 0, 0, 0.5))',

  '& > img': {
    width: '100%',
    height: '100%',
  },
});
