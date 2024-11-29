import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const Container = styled('div')(({ theme }) => ({
  height: '3.2rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  columnGap: '0.8rem',

  wordBreak: 'break-all',

  padding: '0.8rem',

  boxSizing: 'border-box',

  borderRadius: '0.4rem',
  backgroundColor: theme.palette.color.base100,
}));

export const TextContainer = styled('div')({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
});

export const IndexText = styled(Typography)(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.palette.color.base800,
}));

export const WordText = styled(Base1300Text)({
  width: '100%',

  textAlign: 'left',
});
