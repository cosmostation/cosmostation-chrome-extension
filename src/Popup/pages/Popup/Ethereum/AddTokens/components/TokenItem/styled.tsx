import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  position: 'relative',

  backgroundColor: theme.colors.base02,
  border: 0,

  padding: '1.7rem 1.2rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  borderRadius: '0.8rem',
}));

export const LeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  textAlign: 'left',
});

export const LeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const LeftTextContainer = styled('div')({
  paddingLeft: '0.8rem',

  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.3rem',
});

export const LeftTextChainContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const RightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  textAlign: 'right',
});

export const RightTextContainer = styled('div')({
  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.3rem',
});

export const RightTextDisplayAmountContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));
