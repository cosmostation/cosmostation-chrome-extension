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

export const FullContractAddressTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  color: theme.palette.color.base1100,
  overflow: 'hidden',
}));

export const FullContractAddressText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
}));
