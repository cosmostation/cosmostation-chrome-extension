import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  paddingBottom: '1.6rem',
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

export const ListTitleLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const ListTitleLeftCountContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
  marginLeft: '0.4rem',
}));

export const ListTitleRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'flex-end',
});

export const ListContainer = styled('div')({
  marginTop: '0.9rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  overflow: 'auto',
});

export const AddTokenButton = styled('button')(({ theme }) => ({
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
