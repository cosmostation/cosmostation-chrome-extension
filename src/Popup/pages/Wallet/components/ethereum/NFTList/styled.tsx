import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  paddingBottom: '0.9rem',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const ListTitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'space-between',

  flexShrink: 0,
});

export const ListTitleLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'flex-start',
});

export const ListTitleRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'flex-end',
});

export const ListContainer = styled('div')({
  marginTop: '0.9rem',

  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16.4rem, 1fr))',

  gridColumnGap: '0.7rem',
  gridRowGap: '0.8rem',

  overflow: 'auto',
});

export const AddTokenButton = styled('button')(({ theme }) => ({
  marginTop: '0.9rem',

  padding: 0,
  border: 0,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  width: '100%',
  height: '5.8rem',

  '&:hover': {
    backgroundColor: theme.colors.base03,

    cursor: 'pointer',
  },

  '&:disabled': {
    backgroundColor: theme.colors.base02,

    '&:hover': {
      cursor: 'default',
    },
  },

  '& > svg': {
    fill: theme.accentColors.purple01,
    '& > path': { fill: theme.accentColors.purple01 },
  },
}));

export const AddTokenTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',

  color: theme.colors.text01,
}));
