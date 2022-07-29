import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '0 0 1.6rem 0',

  position: 'relative',

  height: '100%',
});

export const ContentsContainer = styled('div')({
  padding: '2rem 1.6rem 0 1.6rem',
});

export const QuestionTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  padding: '0 5rem',
  textAlign: 'center',
}));

export const InfoContainer = styled('div')(({ theme }) => ({
  marginTop: '1.2rem',

  padding: '1.6rem 0',

  border: `0.1rem solid ${theme.colors.base04}`,
  borderRadius: '0.8rem',

  textAlign: 'center',
}));

export const InfoTitleContainer = styled('div')(({ theme }) => ({
  color: theme.accentColors.purple01,
}));

export const InfoContentContainer = styled('div')(({ theme }) => ({
  marginTop: '1rem',
  color: theme.colors.text01,
}));

export const WarningContainer = styled('div')(({ theme }) => ({
  '@keyframes emphasis': {
    from: {
      backgroundColor: 'rgba(205, 26, 26, 0.2)',
    },

    to: {
      backgroundColor: 'rgba(205, 26, 26, 0.1)',
    },
  },

  animationDuration: '0.5s',
  animationName: 'emphasis',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',

  marginTop: '2rem',

  border: `0.1rem solid ${theme.accentColors.red}`,

  borderRadius: '0.8rem',

  padding: '1.6rem',
}));

export const WarningImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > img': {
    width: '5rem',
    height: '5rem',
  },
});

export const WarningRedTextContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',
  color: theme.accentColors.red,
}));

export const WarningWhiteTextContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',
  color: theme.accentColors.white,
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',
  left: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const BottomButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
});
