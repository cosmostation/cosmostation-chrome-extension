import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')({
  height: '100%',
  padding: '0.8rem 1.6rem 1.2rem',

  position: 'relative',
});

export const ContentContainer = styled('div')({
  height: 'calc(100% - 7rem)',
  overflow: 'auto',

  margin: '0 -1.6rem',
  padding: '0 1.6rem',
});

export const NFTContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  borderRadius: '0.8rem',
  backgroundColor: theme.colors.base02,

  padding: '1.6rem',

  marginBottom: '0.8rem',
}));

export const NFTImageContainer = styled('div')({
  '& > img': {
    borderRadius: '0.8rem',

    width: '20rem',
    height: '20rem',
  },
});

export const NFTEditionMarkContainer = styled('div')(({ theme }) => ({
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

export const NFTInfoContainer = styled('div')({
  width: '100%',

  marginTop: '1.6rem',
});

export const NFTInfoHeaderContainer = styled('div')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  paddingBottom: '1.2rem',
  marginBottom: '1.6rem',

  color: theme.colors.text01,
  borderBottom: `0.1rem solid ${theme.colors.base04}`,
}));

export const NFTInfoLeftHeaderContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.8rem',
});

export const NFTInfoHeaderTextContainer = styled('div')({
  maxWidth: '23rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const NFTInfoBodyContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  rowGap: '1rem',
});

export const StyledIconButton = styled(IconButton)({
  padding: '0',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});
