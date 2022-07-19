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

export const OriginListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
});

export const OriginItemContainer = styled('div')(({ theme }) => ({
  borderRadius: '0.8rem',
  paddingLeft: '1.6rem',
  height: '4.8rem',
  backgroundColor: theme.colors.base02,

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  maxWidth: '100%',
  overflow: 'hidden',
}));

export const OriginItemLeftContainer = styled('div')({
  maxWidth: '100%',
  overflow: 'hidden',

  display: 'flex',
  alignItems: 'center',
});

export const OriginItemImageContainer = styled('div')({
  marginRight: '0.8rem',

  flexShrink: 0,

  width: '1.4rem',
  height: '1.4rem',
  '& > img': {
    width: '1.4rem',
    height: '1.4rem',
  },
});

export const OriginItemTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  overflow: 'auto',
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: '0.4rem',

  marginRight: '0.8rem',

  flexShrink: 0,

  '& svg': {
    fill: theme.colors.base05,
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));
