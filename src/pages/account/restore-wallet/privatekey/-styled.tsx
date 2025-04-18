import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import OutlinedInput from '@/components/common/OutlinedInput';

export const FormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const Body = styled('div')({
  paddingTop: '1.2rem',
});

export const TopContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.8rem',
});

export const ViewIconContainer = styled('div')({
  width: '1.6rem',
  height: '1.6rem',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

export const BottomChevronIconContainer = styled('div')({
  width: '1.4rem',
  height: '1.4rem',

  '& > svg': {
    width: '1.4rem',
    height: '1.4rem',
  },
});

export const StyledOutlinedInput = styled(OutlinedInput)(({ theme }) => ({
  '.MuiOutlinedInput-input': {
    '&::placeholder': {
      fontFamily: theme.typography.b2_M.fontFamily,
      fontStyle: theme.typography.b2_M.fontStyle,
      fontSize: theme.typography.b2_M.fontSize,
      lineHeight: theme.typography.b2_M.lineHeight,
      letterSpacing: theme.typography.b2_M.letterSpacing,
    },
  },
}));

export const MarginRightTypography = styled(Base1300Text)({
  marginRight: '0.2rem',
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

export const DescriptionTitle = styled(Base1300Text)({});

export const DescriptionSubTitle = styled(Typography)(({ theme }) => ({
  width: '95%',

  color: theme.palette.color.base1000,
}));

export const PrivateKeyInputWrapper = styled('div')({
  marginTop: '2rem',
});

export const PrivateKeyInputController = styled('div')({
  display: 'flex',

  marginBottom: '0.8rem',
});

export const StyledIconTextButton = styled(IconTextButton)({});

export const ControlInputButtonContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  marginTop: '1.2rem',
});

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.8rem',
  height: '1.8rem',

  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.color.base800,

    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));

export const ControlInputText = styled(Typography)(({ theme }) => ({
  marginLeft: '0.2rem',
  color: theme.palette.color.base1100,
}));
