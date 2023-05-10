import { styled } from '@mui/material/styles';

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

    '&:hover': {
      backgroundColor: theme.colors.base02,
    },
  },

  '&:hover': {
    backgroundColor: theme.colors.base03,

    '#deleteButton': {
      display: 'block',
    },
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

export const ObjectImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > img': {
    borderRadius: '0.8rem',

    width: '14.8rem',
    height: '14.8rem',
  },
});

export const ObjectNameTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const ObjectDescriptionTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));
