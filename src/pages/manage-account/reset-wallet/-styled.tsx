import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';

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
