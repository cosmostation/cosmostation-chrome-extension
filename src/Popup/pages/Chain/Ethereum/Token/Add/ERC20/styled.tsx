import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.9rem 1.6rem 0',
  position: 'relative',
});

export const Div = styled('div')({});

export const WarningContainer = styled('div')({
  padding: '1.2rem 1.6rem',
  display: 'flex',

  backgroundColor: 'rgba(205, 26, 26, 0.15)',
  borderRadius: '0.8rem',

  marginBottom: '1.6rem',
});

export const WarningIconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.accentColors.red,

    '& > path': {
      fill: theme.accentColors.red,
    },
  },
}));

export const WarningTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.colors.text01,
}));

export const ButtonContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});
