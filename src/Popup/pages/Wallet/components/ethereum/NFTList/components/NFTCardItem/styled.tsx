import { styled } from '@mui/material/styles';

import AbsoluteLoading from '~/Popup/components/AbsoluteLoading';
import IconButton from '~/Popup/components/common/IconButton';

export const StyledButton = styled('button')(({ theme }) => ({
  width: '16.4rem',

  position: 'relative',

  backgroundColor: theme.colors.base02,
  border: 0,

  padding: '0.8rem',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',

  rowGap: '1rem',

  borderRadius: '0.8rem',

  cursor: 'pointer',

  '&:disabled': {
    cursor: 'default',
  },

  '&:hover': {
    backgroundColor: theme.colors.base03,

    '#deleteButton': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
}));

export const SkeletonButton = styled('button')(({ theme }) => ({
  width: '16.4rem',

  position: 'relative',

  backgroundColor: theme.colors.base02,
  border: 0,

  padding: '0.8rem',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',

  rowGap: '1rem',

  borderRadius: '0.8rem',

  cursor: 'pointer',

  '&:disabled': {
    cursor: 'default',
  },

  '&:hover': {
    backgroundColor: theme.colors.base03,
  },
}));

export const BodyContainer = styled('div')({});

export const BottomContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',

  rowGap: '0.2rem',
});

export const BottomErrorContainer = styled('div')({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const BottomErrorLeftContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',

  rowGap: '0.2rem',

  maxWidth: '12rem',
});

export const BottomErrorRightContainer = styled('div')({});

export const NFTImageContainer = styled('div')({
  '& > img': {
    borderRadius: '0.8rem',

    width: '14.8rem',
    height: '14.8rem',
  },

  position: 'relative',
});

export const NFTAbsoluteEditionMarkContainer = styled('div')(({ theme }) => ({
  position: 'absolute',

  left: '0.8rem',
  bottom: '0.8rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '0 0.8rem',

  width: 'fit-content',
  height: '1.9rem',

  borderRadius: '1.2rem',

  color: theme.accentColors.white,

  backgroundImage: `linear-gradient(90deg, #9C6CFF 37.5%, #05D2DD 100%)`,
}));

export const NFTDescriptionTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const NFTNameTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const BottomErrorHeaderContainer = styled('div')(({ theme }) => ({
  color: theme.accentColors.red,
}));

export const BottomErrorFooterContainer = styled('div')(({ theme }) => ({
  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  color: theme.colors.text01,
}));

export const DeleteButton = styled('div')(({ theme }) => ({
  position: 'absolute',
  zIndex: 1,

  top: '-0.4rem',
  right: '-0.4rem',

  display: 'none',

  borderRadius: '50%',

  backgroundColor: theme.accentColors.red,

  '& > svg': {
    fill: theme.accentColors.white,
    '& > path': {
      fill: theme.accentColors.white,
    },
  },
}));

export const BlurredImage = styled('div')(({ theme }) => ({
  position: 'absolute',
  zIndex: 1,

  width: '14.8rem',
  height: '14.8rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '0.8rem',

  backgroundColor: 'rgba(0, 0, 0, 0.6)',

  backdropFilter: 'blur(0.1rem)',

  color: theme.accentColors.white,
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: '0',

  '& svg': {
    fill: theme.colors.base05,
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.8rem',
});
