import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import TextButton from '@/components/common/TextButton';

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const BodyContainer = styled('div')({});

export const BodyTopContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  margin: '1.2rem 0 0.2rem',

  columnGap: '0.4rem',

  color: theme.palette.color.base1300,
}));

export const StyledTextButton = styled(TextButton)(({ theme }) => ({
  '&.Mui-disabled, &:disabled': {
    color: theme.palette.color.base1300,
  },
}));

export const BodyBottomContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',

  marginBottom: '1.4rem',

  color: theme.palette.color.base1000,
}));

export const BottomButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',

  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.01)',
  backdropFilter: 'blur(0.4rem)',
  WebkitBackdropFilter: 'blur(0.4rem)',

  marginTop: '0.6rem',

  borderTop: '0.1rem solid rgba(255, 255, 255, 0.01)',
  borderBottom: '0.1rem solid rgba(255, 255, 255, 0.01)',
});

export const StyledIconTextButton = styled(IconTextButton)({
  width: '100%',

  padding: '1.3rem 0',
  '&:not(:last-child)': {
    borderRight: '0.1rem solid rgba(255, 255, 255, 0.01)',
  },
});

export const IconContainer = styled('div')({
  width: '2.2rem',
  height: '2.2rem',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});

export const SpacedTypography = styled(Base1300Text)({
  marginTop: '0.4rem',
});

export const ChangeAddressIconButtonContainer = styled('div')({
  marginLeft: '0.4rem',
});
