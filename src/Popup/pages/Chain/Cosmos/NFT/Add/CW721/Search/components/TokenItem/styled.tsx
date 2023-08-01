import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: theme.colors.base01,
  border: 0,
  padding: '1.2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '5.8rem',
  borderRadius: '0.8rem',
  cursor: 'pointer',
  '&:disabled': {
    cursor: 'default',
  },
  '&:hover': {
    backgroundColor: theme.colors.base02,
  },
  '&:focus': {
    backgroundColor: theme.colors.base02,
  },
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

export const LeftTextContainer = styled('div')(({ theme }) => ({
  paddingLeft: '0.8rem',
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.3rem',
  color: theme.colors.text01,
}));

export const LeftTextErrorContainer = styled('div')(({ theme }) => ({
  color: theme.accentColors.red,
}));

export const RightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg > path': {
    fill: theme.colors.base05,
  },
}));
