import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  height: '100%',
  padding: '1.2rem 1.6rem',

  position: 'relative',
});

export const ContentContainer = styled('div')({});

export const NFTContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  borderRadius: '0.8rem',
  backgroundColor: theme.colors.base02,

  padding: '1.6rem',
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
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const NFTInfoHeaderTextContainer = styled('div')({
  maxWidth: '25rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
