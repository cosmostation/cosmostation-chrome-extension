import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const Body = styled('div')({
  paddingTop: '1.2rem',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',

  width: '100%',

  rowGap: '0.6rem',
  padding: '0.4rem 0.4rem 0',

  marginBottom: '2rem',
});

export const DescriptionTitle = styled(Base1300Text)({});

export const DescriptionSubTitle = styled(Base1300Text)(({ theme }) => ({
  width: '95%',
  color: theme.palette.color.base1000,
}));
