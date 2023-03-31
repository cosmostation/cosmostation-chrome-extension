import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const LeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const RightTextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  justifyContent: 'center',
  alignItems: 'flex-end',
});

export const TextContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
