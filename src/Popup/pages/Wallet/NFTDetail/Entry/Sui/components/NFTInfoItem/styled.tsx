import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

export const ItemContainer = styled('div')({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const ItemColumnContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.4rem',
});

export const ItemTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const ItemValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const ItemRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  maxWidth: '17rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  columnGap: '0.6rem',

  color: theme.colors.text01,
}));

export const StyledIconButton = styled(IconButton)({
  padding: '0',
  margin: '0',

  '& svg': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

export const URLButton = styled('button')(({ theme }) => ({
  border: 0,

  color: theme.accentColors.purple01,

  backgroundColor: 'transparent',

  cursor: 'pointer',

  '&:hover': {
    color: theme.accentColors.purple02,
  },
}));
