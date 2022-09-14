import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '0 0 1.6rem 0',

  position: 'relative',

  height: '100%',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  textAlign: 'center',
  padding: '2.4rem 0',
}));

export const ContentsContainer = styled('div')({
  padding: '0 1.6rem',
});

export const StepsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
});

export const StepContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',

  backgroundColor: theme.colors.base01,
  height: '16.6rem',
  width: '32.8rem',

  borderRadius: '0.8rem',
  border: `0.1rem solid ${theme.colors.base03}`,
}));

export const StepImage = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const StepTitle = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  marginTop: '1.6rem',

  textAlign: 'center',
}));

export const StepDescription = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  marginTop: '0.8rem',

  textAlign: 'center',
}));

export const BottomArrowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  margin: '1.6rem 0',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
  left: '1.6rem',
});

export const AccentSpan = styled('span')(({ theme }) => ({
  color: theme.accentColors.purple01,
}));
