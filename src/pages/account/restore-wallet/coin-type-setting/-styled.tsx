import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const FooterContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginBottom: '2.8rem',
});

export const Body = styled('div')({
  paddingTop: '0.8rem',
});

export const CoinTypeSelectorContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '1.6rem 0',
  rowGap: '3.2rem',
});

export const DescriptionText = styled(Base1300Text)({
  marginRight: '0.4rem',
});

export const Footer = styled('div')({
  width: '100%',
  height: 'fit-content',

  boxSizing: 'border-box',

  position: 'sticky',
  bottom: '1.2rem',
  zIndex: 1000,
});
