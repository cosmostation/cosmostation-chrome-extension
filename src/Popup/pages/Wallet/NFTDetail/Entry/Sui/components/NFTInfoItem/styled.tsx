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

  fontFamily: theme.typography.h5.fontFamily,
  fontStyle: theme.typography.h5.fontStyle,
  fontSize: theme.typography.h5.fontSize,
  lineHeight: '2rem',
  letterSpacing: theme.typography.h5.letterSpacing,
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

export const URLButton = styled('button')(({ theme }) => ({
  border: 0,

  color: theme.accentColors.blue01,

  backgroundColor: 'transparent',

  cursor: 'pointer',

  '&:hover': {
    color: theme.accentColors.blue02,
  },
}));

export const AttributeContainer = styled('div')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',

  rowGap: '1rem',

  borderTop: `0.1rem solid ${theme.colors.base04}`,
}));

export const AttributeHeaderContainer = styled('div')(({ theme }) => ({
  marginTop: '1.6rem',

  display: 'flex',
  justifyContent: 'flex-start',

  color: theme.colors.text01,
}));
