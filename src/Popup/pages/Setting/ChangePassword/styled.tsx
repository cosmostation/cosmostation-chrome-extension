import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: 'calc(100% - 2.4rem)',
  height: '100%',

  padding: '0 1.2rem',
});

export const CurrentPasswordContainer = styled('div')({
  padding: '0.8rem 0 2rem 0',
});

export const NewPasswordContainer = styled('div')({
  padding: '2rem 0 0.8rem 0',
});

export const StyledForm = styled('form')({
  width: '100%',
  height: '100%',

  position: 'relative',
});

export const ButtonContainer = styled('div')({
  position: 'absolute',

  width: '100%',

  bottom: '1.6rem',
});
