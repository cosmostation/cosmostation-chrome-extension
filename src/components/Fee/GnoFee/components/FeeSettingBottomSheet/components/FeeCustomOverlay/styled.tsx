import { styled } from '@mui/material/styles';

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

export const FeeContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: '0.6rem',
  margin: '0.4rem 0 2.2rem',
});

export const InputContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '2.2rem',
});

export const BottomContainer = styled('div')({
  marginTop: 'auto',
});

export const EstimatedFeeTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'baseline',
});

export const InformationContainer = styled('div')({
  marginBottom: '1.6rem',
});
