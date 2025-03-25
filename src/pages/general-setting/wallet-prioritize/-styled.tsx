import { styled } from '@mui/material/styles';

import Image from '@/components/common/Image';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  width: '100%',
  height: '100%',
});

export const InformationPanelContainer = styled('div')({
  marginTop: '0.8rem',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',

  boxSizing: 'border-box',
  marginTop: '1.6rem',
});

export const SwitchContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '1.4rem 0.4rem',
});

export const SwitchLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  columnGap: '1rem',
});

export const ProviderImage = styled(Image)({
  width: '3.2rem',
  height: '3.2rem',

  '& > img': {
    width: '100%',
    height: '100%',
  },
});
