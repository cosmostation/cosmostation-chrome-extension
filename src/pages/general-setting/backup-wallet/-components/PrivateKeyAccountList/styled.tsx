import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const BodyContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const AccountImgContainer = styled('div')({
  width: '2.8rem',
  height: '2.8rem',
});

export const EmptyAssetContainer = styled('div')({
  position: 'absolute',

  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});
