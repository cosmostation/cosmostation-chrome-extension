import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import OutlinedChipButton from '../OutlinedChipButton';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
});

export const IconContainer = styled('div')({
  width: '7rem',
  height: '7rem',
  marginBottom: '0.8rem',
  '& > svg': {
    width: '100%',
    height: '100%',
  },
});

export const TextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minWidth: '22rem',
  maxWidth: '60%',
  marginBottom: '0.4rem',
});

export const TitleText = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.color.base800,
  marginBottom: '0.4rem',
}));

export const SubTitleText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base700,
  wordBreak: 'break-word',
  textAlign: 'center',
}));

export const StyledOutlinedChipButton = styled(OutlinedChipButton)({
  marginTop: '1.2rem',
});
