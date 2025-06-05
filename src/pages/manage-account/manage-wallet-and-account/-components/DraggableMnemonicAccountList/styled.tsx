import { styled } from '@mui/material/styles';

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  width: '100%',
});

export const EmptyAssetContainer = styled('div')({
  position: 'absolute',

  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});
