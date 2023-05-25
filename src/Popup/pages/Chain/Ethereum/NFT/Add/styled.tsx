import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.9rem 1.6rem 0',
  position: 'relative',
});

export const Div = styled('div')({});

export const ButtonContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const StyledInput = styled(Input)({
  height: '4.8rem',
});

export const NFTPreviewContainer = styled('div')(({ theme }) => ({
  height: '30.5rem',

  padding: '1.6rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base02,
}));

export const NFTPreviewHeaderContainer = styled('div')(({ theme }) => ({
  textAlign: 'start',

  color: theme.colors.text02,
}));

export const NFTPreviewBodyContainer = styled('div')({
  height: '100%',

  display: 'flex',
  flexDirection: 'column',

  justifyContent: 'center',
  alignItems: 'center',
});

export const PreviewNFTImageContainer = styled('div')({
  '& > img': {
    borderRadius: '0.8rem',

    width: '20rem',
    height: '20rem',
  },
});

export const PreviewNFTNameContainer = styled('div')(({ theme }) => ({
  marginTop: '1.6rem',

  color: theme.colors.text01,
}));
