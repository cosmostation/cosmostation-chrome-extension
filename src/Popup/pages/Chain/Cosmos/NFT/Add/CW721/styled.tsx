import { styled } from '@mui/material/styles';

import AbsoluteLoading from '~/Popup/components/AbsoluteLoading';
import IconButton from '~/Popup/components/common/IconButton';

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

export const PreviewContainer = styled('div')(({ theme }) => ({
  height: '30rem',

  padding: '1.6rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base02,

  position: 'relative',
}));

export const PreviewHeaderContainer = styled('div')(({ theme }) => ({
  height: 'fit-content',

  textAlign: 'start',

  color: theme.colors.text02,
}));

export const PreviewBodyContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  height: '100%',
});

export const PreviewNFTImageContainer = styled('div')({
  width: '100%',

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

  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  color: theme.colors.text01,
}));

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.8rem',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: '0',
  margin: '0',

  '& svg': {
    width: '1.6rem',
    height: '1.6rem',
    '& > path': {
      fill: theme.colors.base05,
    },
    '&:hover': {
      '& > path': {
        fill: theme.colors.base06,
      },
    },
  },
}));
