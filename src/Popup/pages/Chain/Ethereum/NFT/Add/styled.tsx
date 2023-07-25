import { styled } from '@mui/material/styles';

import AbsoluteLoading from '~/Popup/components/AbsoluteLoading';
import IconButton from '~/Popup/components/common/IconButton';
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

export const PreviewContainer = styled('div')(({ theme }) => ({
  height: '30.5rem',

  padding: '1.6rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base02,

  position: 'relative',
}));

export const PreviewItemContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',

  rowGap: '0.4rem',
});

export const PreviewImageItemContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',

  rowGap: '2rem',
});

export const PreviewItemHeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  columnGap: '0.4rem',

  color: theme.colors.text02,
}));

export const PreviewItemSubHeaderContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const PreviewContentContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  rowGap: '1.6rem',

  margin: '0 -1.6rem',
  padding: '0 1.6rem',

  height: '100%',
  overflow: 'auto',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
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

export const PreviewBodyContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  height: '100%',
});

export const PreviewHeaderContainer = styled('div')(({ theme }) => ({
  height: 'fit-content',

  textAlign: 'start',

  color: theme.colors.text02,
}));
