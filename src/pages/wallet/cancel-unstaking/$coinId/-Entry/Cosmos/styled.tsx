import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import BaseCoinImage from '@/components/common/BaseCoinImage';

export const CoinContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  margin: '1.6rem 0 2.2rem',
});

export const CoinImage = styled(BaseCoinImage)({
  width: '3.6rem',
  height: '3.6rem',
});

export const CoinSymbolText = styled(Base1300Text)({
  marginTop: '0.8rem',
});

export const ChainNameContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  marginTop: '0.4rem',

  color: theme.palette.color.base1000,
}));

export const InputWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: '2.2rem',
});

export const Divider = styled('div')(({ theme }) => ({
  margin: '1.2rem 0',
  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
}));

export const EstimatedValueTextContainer = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const LockDateTextSpan = styled('span')(({ theme }) => ({
  color: theme.palette.accentColor.red400,
}));
