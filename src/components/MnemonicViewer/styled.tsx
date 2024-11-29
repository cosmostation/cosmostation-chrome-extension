import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '../common/Base1300Text';
import IconTextButton from '../common/IconTextButton';

export const Container = styled('div')({});

export const TopContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.8rem',
});

export const MnemonicContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',

  gap: '0.6rem',

  borderRadius: '0.8rem',
  backgroundColor: 'transparent',

  marginTop: '0.8rem',
});

export const MarginRightTypography = styled(Base1300Text)({
  marginRight: '0.2rem',
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

export const ControlInputButtonContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  marginTop: '1.2rem',
});

export const StyledIconTextButton = styled(IconTextButton)({});

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
