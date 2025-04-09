import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import TextButton from '@/components/common/TextButton';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  padding: '1.6rem',
});

export const TitleText = styled(Base1300Text)({
  textAlign: 'left',

  marginBottom: '0.9rem',
});

export const AmountDetailWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  rowGap: '0.8rem',
});

export const AmountDetailAttributeWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  marginTop: '0.6rem',

  rowGap: '0.5rem',
});

export const DetailRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const StyledTextButtonWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const StyledTextButton = styled(TextButton)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.4rem',
  height: '1.4rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base1000,

    '& > path': {
      fill: theme.palette.color.base1000,
    },
  },
}));

export const LabelLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.6rem',

  '& > svg': {
    fill: theme.palette.color.base900,
  },
}));

export const LabelText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const LabelAttributeText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base900,
}));

export const ValueAttributeText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base900,
}));

export const ValueText = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const PendingAmountContainer = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base700,
}));
