import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  padding: '1.6rem 1.6rem 1.5rem',

  background: theme.colors.base02,
  borderRadius: '0.8rem',
}));

export const HeaderContainer = styled('div')({
  height: '2rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const HeaderLeftContainer = styled('div')(({ theme }) => ({
  color: theme.accentColors.purple01,
}));

export const HeaderRightContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const BodyContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  margin: '1.2rem 0 0',
}));

export const SwapAssetContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginBottom: '1.2rem',
});

export const ContentLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const ContentLeftChainImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginRight: '0.4rem',

  width: '2.4rem',
  height: '2.4rem',
  position: 'relative',
});

export const ContentLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginRight: '0.6rem',

  width: '2rem',
  height: '2rem',
  position: 'relative',
});

export const ContentLeftAbsoluteChainImageContainer = styled('div')({
  position: 'absolute',

  width: '2.4rem',
  height: '2.4rem',

  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const ContentLeftAbsoluteImageContainer = styled('div')({
  position: 'absolute',

  width: '2rem',
  height: '2rem',

  '& > img': {
    width: '2rem',
    height: '2rem',
  },
});

export const ContentCenterTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  maxWidth: '8rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

type ContentPlaceholderContainerProps = {
  'data-is-disabled': boolean;
};

export const ContentPlaceholderContainer = styled('div')<ContentPlaceholderContainerProps>(({ theme, ...props }) => ({
  color: props['data-is-disabled'] ? theme.colors.text02 : theme.colors.text01,
}));

export const FooterContainer = styled('div')({
  height: '1.8rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const FooterLeftContainer = styled('div')(({ theme }) => ({
  width: '60%',
  maxWidth: '100%',

  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  color: theme.colors.text02,
}));

export const FooterRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.colors.text02,
}));
