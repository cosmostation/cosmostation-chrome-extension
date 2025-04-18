import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';

export const Overlay = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  height: '100vh',
  maxWidth: '54rem',
  width: '100%',

  display: 'flex',
  flexDirection: 'column',

  backgroundColor: theme.palette.color.base50,
  zIndex: 1001,
}));

export const HeaderContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.color.base100,
}));

export const HeaderLeftContainer = styled('div')({
  width: '100%',
  height: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  columnGap: '0.8rem',
});

export const IconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.palette.color.base1300,
    '& > path': {
      fill: theme.palette.color.base1300,
    },
  },
}));

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: '1.2rem',
});

export const Body = styled('div')({
  padding: '0.4rem',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',

  width: '100%',

  rowGap: '0.6rem',
});

export const DescriptionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const DescriptionSubTitle = styled(Typography)(({ theme }) => ({
  width: '95%',

  color: theme.palette.color.base1000,
}));

export const CheckBoxContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '2.4rem',

  marginTop: '2.4rem',
});

export const StyledCheckBoxContainer = styled(CheckBoxTextButton)({
  width: '100%',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
});

export const CheckBoxTextContainer = styled('div')({
  width: '90%',
  textAlign: 'left',
});
