import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';

export const Overlay = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  height: '100vh',
  maxWidth: '54rem',
  width: '100%',

  display: 'flex',
  flexDirection: 'column',

  backgroundColor: theme.palette.color.base50,
}));

export const HeaderContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.color.base100,
}));

export const HeaderLeftContainer = styled('div')({
  width: '100%',
  height: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  columnGap: '0.8rem',
});

export const IconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.palette.color.base1300,
    '& > path': {
      fill: theme.palette.color.base1300,
    },
  },
}));

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: '0.6rem',
});

export const TitleText = styled(Base1300Text)({});

export const MessageContaienr = styled('div')({
  maxWidth: '33rem',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  textAlign: 'center',
});

export const StyledBaseFooter = styled(BaseFooter)({
  padding: '0 1.2rem 1.2rem',
  boxSizing: 'border-box',
});

export const MessageText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
}));
