import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const FormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',

  boxSizing: 'border-box',
});

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  width: '100%',
  height: '100%',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',

  width: '100%',

  rowGap: '0.6rem',

  margin: '1.6rem 0 2rem',
});

export const DescriptionTitle = styled(Base1300Text)({});

export const DescriptionSubTitle = styled(Base1300Text)(({ theme }) => ({
  width: '95%',
  color: theme.palette.color.base1000,
}));
