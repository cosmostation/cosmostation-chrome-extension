import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  position: 'relative',
});

export const ButtonContainer = styled('div')({
  position: 'absolute',
  width: 'calc(100% - 3.2rem)',
  height: '8rem',

  bottom: '0',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const StyledButton = styled(Button)({});
