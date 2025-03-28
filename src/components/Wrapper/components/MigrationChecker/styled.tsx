import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Button from '@/components/common/Button';

export const Container = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '10%',
});

export const ContentsContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const ImgContainer = styled('img')({
  width: '10rem',
  height: 'auto',
  marginBottom: '1.6rem',
});

export const DescriptionText = styled(Typography)(({ theme }) => ({
  width: '80%',

  color: theme.palette.color.base1000,

  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',

  textAlign: 'center',

  margin: '0.8rem 0  1.6rem',
}));

export const LinearProgressContainer = styled('div')({
  width: '80%',
});

export const LoadingProgressText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
  marginTop: '1.6rem',
}));

export const RetryButton = styled(Button)({
  width: '15rem',
  marginTop: '1.2rem',
});
