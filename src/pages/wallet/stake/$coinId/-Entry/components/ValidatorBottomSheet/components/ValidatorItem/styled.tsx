import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  isActive: boolean;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  padding: '1.2rem 1.6rem',

  backgroundColor: props['isActive'] ? theme.palette.color.base200 : 'transparent',
  border: 'none',

  '&: hover': {
    backgroundColor: theme.palette.color.base100,
  },
}));

export const ImageContainer = styled('div')({
  width: '3.2rem',
  height: '3.2rem',
  borderRadius: '50%',
  overflow: 'hidden',
  '& > img': {
    width: '100%',
    height: '100%',
  },
});

export const ValidatorNameContainer = styled('div')({
  display: 'flex',

  maxWidth: '14rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',
  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const InfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  rowGap: '0.2rem',
});

export const VotingPowerTextContainer = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const VotinPowerContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
