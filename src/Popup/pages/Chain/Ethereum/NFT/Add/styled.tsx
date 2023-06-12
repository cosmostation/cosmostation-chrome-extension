import { styled } from '@mui/material/styles';

import AbsoluteLoading from '~/Popup/components/AbsoluteLoading';
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

  position: 'relative',
}));

export const NFTPreviewHeaderContainer = styled('div')(({ theme }) => ({
  height: 'fit-content',

  textAlign: 'start',

  color: theme.colors.text02,
}));

export const NFTPreviewBodyContentContainer = styled('div')({
  height: '100%',
  overflow: 'auto',
});

export const InvalidPreviewNFTImageContainer = styled('div')(({ theme }) => ({
  width: '20rem',
  height: '20rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.colors.text01,
  backgroundColor: theme.colors.base04,

  borderRadius: '0.8rem',
}));

export const InvalidPreviewNFTImageTextContainer = styled('div')({
  maxWidth: '18rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const NFTPreviewBodyContainer = styled('div')({
  height: '100%',
  overflow: 'auto',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '1.6rem 0',
});

export const PreviewNFTImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > img': {
    borderRadius: '0.8rem',

    width: '20rem',
    height: '20rem',
  },
});

export const PreviewNFTSubtitleContainer = styled('div')(({ theme }) => ({
  marginTop: '1.6rem',

  color: theme.colors.text01,
}));

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.8rem',
});
