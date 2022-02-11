import { styled } from '@mui/material/styles';

export const Body = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  // TODO: 테스트 이후 삭제
  backgroundColor: theme.colors.text01,
}));

export const Container = styled('div')(({ theme }) => ({
  width: '36rem',
  height: '60rem',

  backgroundColor: theme.colors.base01,

  overflow: 'hidden',
}));
