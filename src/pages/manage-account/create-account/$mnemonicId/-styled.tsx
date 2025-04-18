import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';

export const FormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});

export const Body = styled('div')({
  paddingTop: '1.2rem',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',

  width: '100%',
  padding: '0.4rem 0.4rem 0',

  rowGap: '0.6rem',
});

export const DescriptionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const DescriptionSubTitle = styled(Typography)(({ theme }) => ({
  width: '95%',

  color: theme.palette.color.base1000,
}));

export const InputContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '2.4rem',

  marginTop: '1.6rem',
});

export const MajorNetworkContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '2.2rem',
});

export const MajorNetworkTextContainer = styled('div')({
  margin: '2.4rem auto 0.8rem 0',
});

export const MajorNetworkText = styled(Base1300Text)({});

export const MajorNetwork = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '1.2rem 0.4rem',
});

export const MajorNetworkLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.6rem',
});

export const MajorNetworkRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const MajorNetworkImage = styled(Image)({
  width: '3.6rem',
  height: '3.6rem',
});
