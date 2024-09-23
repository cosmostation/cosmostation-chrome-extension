import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';

export const Container = styled('div')({
  padding: '2.1rem 1.6rem 1.6rem 1.6rem',
});

export const ButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1.6rem',
  marginTop: '2.4rem',
});

export const StyledButton = styled(Button)({
  height: '4rem',
});

export const TextContainer = styled('div')({
  textAlign: 'center',
});
