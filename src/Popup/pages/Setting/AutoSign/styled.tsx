import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem',

  overflow: 'hidden',
});

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '1.2rem',

  width: '100%',
  maxHeight: '100%',

  overflow: 'auto',
});

export const AutoSignListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
});

export const AutoSignItemContainer = styled('div')(({ theme }) => ({
  borderRadius: '0.8rem',
  padding: '1.4rem 1.6rem 1.6rem',
  backgroundColor: theme.colors.base02,

  position: 'relative',

  maxWidth: '100%',
  overflow: 'hidden',
}));

export const AutoSignItemChainContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const AutoSignItemChainImageContainer = styled('div')({
  width: '2rem',
  height: '2rem',

  '& > img': {
    width: '2rem',
    height: '2rem',
  },
});

export const AutoSignItemChainTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.8rem',
  color: theme.colors.text01,
}));

export const AutoSignItemOriginContainer = styled('div')({
  marginTop: '0.8rem',

  maxWidth: '100%',
  overflow: 'hidden',

  display: 'flex',
  alignItems: 'center',
});

export const AutoSignItemOriginImageContainer = styled('div')({
  marginRight: '0.8rem',

  flexShrink: 0,

  width: '1.4rem',
  height: '1.4rem',
  '& > img': {
    width: '1.4rem',
    height: '1.4rem',
  },
});

export const AutoSignItemOriginTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  overflow: 'auto',
}));

export const AutoSignItemEndTimeContainer = styled('div')(({ theme }) => ({
  marginTop: '0.6rem',
  color: theme.accentColors.purple01,
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  padding: '0.4rem',

  top: '1.2rem',
  right: '0.8rem',

  '& svg': {
    fill: theme.colors.base05,
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));
