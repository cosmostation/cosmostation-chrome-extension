import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import TextButton from '@/components/common/TextButton';

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

export const ErrorContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: '2.4rem',
});

export const ErrorTopContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.4rem',
});

export const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.accentColor.red400,
}));

export const ErrorTextButton = styled(TextButton)(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
}));

export const RightArrowIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  marginLeft: '0.2rem',
  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.color.base800,

    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));

export const LinearProgressContainer = styled('div')({
  width: '80%',
  marginBottom: '1.6rem',
});

export const LoadingProgressText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
}));

export const FooterContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  columnGap: '0.4rem',

  marginBottom: '3rem',
});
