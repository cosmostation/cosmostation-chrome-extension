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
  '& > img': {
    borderRadius: '0.8rem',

    width: '14.8rem',
    height: '14.8rem',
  },

  position: 'relative',
});

export const ObjectAbsoluteEditionMarkContainer = styled('div')(({ theme }) => ({
  position: 'absolute',

  left: '0.8rem',
  bottom: '0.8rem',

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

export const ObjectDescriptionTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const ObjectNameTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));
