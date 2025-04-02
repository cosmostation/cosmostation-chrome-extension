import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import OutlinedInput from '@/components/common/OutlinedInput';

export const Body = styled('div')({
  paddingTop: '2.4rem',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',

  width: '100%',

  rowGap: '0.6rem',
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

export const MarginRightTypography = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const DescriptionTitle = styled(Base1300Text)({});

export const DescriptionSubTitle = styled(Typography)(({ theme }) => ({
  width: '95%',

  color: theme.palette.color.base1000,
}));

export const MnemonicInputWrapper = styled('div')({
  marginTop: '2rem',
});

export const MnemonicInputController = styled('div')({
  display: 'flex',

  marginBottom: '0.8rem',
});

export const MnemonicInputContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',

  gap: '0.8rem',
});

export const StyledInput = styled(OutlinedInput)(({ theme, ...props }) => ({
  height: '3.2rem',

  '.MuiOutlinedInput-input': {
    fontFamily: theme.typography.b3_M.fontFamily,
    fontStyle: theme.typography.b3_M.fontStyle,
    fontSize: theme.typography.b3_M.fontSize,
    lineHeight: theme.typography.b3_M.lineHeight,
    letterSpacing: theme.typography.b3_M.letterSpacing,

    WebkitTextSecurity: props.type === 'password' ? 'disc' : 'none',
    MoxTextSecurity: props.type === 'password' ? 'disc' : 'none',

    '&[type=password]': {
      letterSpacing: '0',
    },
  },

  '.MuiOutlinedInput-notchedOutline': {
    border: props['error'] ? `0.1rem solid ${theme.palette.accentColor.red400}` : `none`,
  },

  '&:hover': {
    '.MuiOutlinedInput-notchedOutline': {
      border: `0.1rem solid ${theme.palette.accentColor.purple400}`,
    },
  },
  '&.Mui-focused': {
    '.MuiOutlinedInput-notchedOutline': {
      border: `0.1rem solid ${theme.palette.accentColor.purple400}`,
    },
  },
}));

export const StyledIconTextButton = styled(IconTextButton)({});

export const MnemonicWordIndexText = styled(Typography)(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  color: theme.palette.color.base800,
}));

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

export const HdPathContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  marginBottom: '2.4rem',
});

export const HdPathDescription = styled(Typography)(({ theme }) => ({
  marginRight: '0.6rem',
  color: theme.palette.color.base1300,
}));
