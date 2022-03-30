import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0 2.4rem',

  position: 'relative',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  paddingTop: '7.6rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const DescriptionContainer = styled('div')(({ theme }) => ({
  paddingTop: '1.6rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const CheckContainer = styled('div')({
  paddingTop: '11rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const Check = styled('div')(({ theme }) => ({
  width: '10rem',
  height: '10rem',
  borderRadius: '50%',

  backgroundColor: theme.accentColors.purple01,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 4.8rem)',

  bottom: '2.4rem',
});
