import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  padding: '1.6rem',

  rowGap: '0.6rem',
});

export const TitleText = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.color.base800,

    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));

export const FullContractAddressText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
}));
