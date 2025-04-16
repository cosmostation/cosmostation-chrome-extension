import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '1.4rem 1.6rem',

  backgroundColor: 'transparent',
  border: 'none',

  '&: hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const LeftContainer = styled('div')({
  width: 'fit-content',

  marginRight: '1.2rem',
});

export const MiddleContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.4rem',
});

export const RightContainer = styled('div')({
  width: 'fit-content',
});

export const IconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  padding: '0.7rem',

  borderRadius: '0.9rem',

  backgroundColor: theme.palette.color.base300,
}));

export const TitleText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const BodyText = styled(Typography)(({ theme }) => ({
  width: '80%',

  color: theme.palette.color.base900,
  wordBreak: 'break-word',

  textAlign: 'left',

  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
}));
