import { styled } from '@mui/material/styles';

import AbsoluteLoading from '@/components/common/AbsoluteLoading';

export const Container = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const InputWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: '2.2rem',
});

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
  margin: '1.2rem 0 1.6rem',
}));

export const LabelContainer = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: '2rem',
});

export const PreviewContainer = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  borderRadius: '0.4rem',
  marginBottom: '1.2rem',

  position: 'relative',
});

export const PreviewHeaderContainer = styled('div')(({ theme }) => ({
  height: 'fit-content',

  textAlign: 'start',

  color: theme.palette.color.base1300,
}));

export const PreviewBodyContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  height: '100%',
});

export const PreviewNFTImageContainer = styled('div')({
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

export const PreviewNFTSubtitleContainer = styled('div')(({ theme }) => ({
  marginTop: '1.6rem',

  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  color: theme.palette.color.base1300,
}));

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.4rem',
});

export const PreviewItemHeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  columnGap: '0.4rem',

  color: theme.palette.color.base1300,
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

export const PreviewItemContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',

  rowGap: '0.4rem',
});
