import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  rowGap: '0.8rem',
});

export const TextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  rowGap: '0.4rem',
});

export const TitleText = styled(Base1300Text)({});

export const MessageContaienr = styled('div')({
  maxWidth: '33rem',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  textAlign: 'center',
});

export const MessageText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
}));
