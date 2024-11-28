import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import IconTextButton from '@/components/common/IconTextButton';

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

// TOOD Base1300 컴포넌트로 교체필요.
export const DescriptionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

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
