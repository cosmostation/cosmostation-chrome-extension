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

export const OptionButtonsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  marginTop: '1.6rem',
});

export const DescriptionText = styled(Base1300Text)({
  marginRight: '0.4rem',
});
