import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '2.4rem',

  width: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  position: 'relative',
});

export const BackButton = styled('button')(({ theme }) => ({
  left: '2.4rem',

  width: '2.8rem',
  height: '2.8rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  position: 'absolute',

  backgroundColor: theme.colors.base03,

  borderRadius: '50%',

  border: 0,
  margin: 0,

  cursor: 'pointer',

  '& svg': {
    fill: theme.colors.base06,
  },
}));

export const StepsContainer = styled('div')({
  width: '100%',
  height: '2.8rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const StepContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

type StepProps = {
  'data-is-active'?: number;
};

export const Step = styled('div')<StepProps>(({ theme, ...props }) => ({
  width: '2rem',
  height: '2rem',

  borderRadius: '50%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: props['data-is-active'] ? theme.accentColors.purple01 : theme.colors.base03,
  color: props['data-is-active'] ? theme.accentColors.white : theme.colors.text02,

  '& > h6': {
    lineHeight: '1.4rem',
  },
}));

export const ConnectionLine = styled('div')(({ theme }) => ({
  height: '0.1rem',
  width: '1.6rem',
  backgroundColor: theme.colors.base03,
}));
