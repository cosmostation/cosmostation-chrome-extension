import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import BaseNFTImage from '@/components/common/BaseNFTImage';

export const NFTContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  margin: '1.6rem 0 1.2rem',
});

export const NFTImage = styled(BaseNFTImage)({
  width: '6.2rem',
  height: '6.2rem',
});

export const NFTName = styled(Base1300Text)({
  marginTop: '1.2rem',
});

export const NFTSubname = styled('div')(({ theme }) => ({
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
