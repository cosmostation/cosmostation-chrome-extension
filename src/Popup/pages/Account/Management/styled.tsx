import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  position: 'relative',
});

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  width: '100%',
  maxHeight: 'calc(100% - 8rem)',

  overflow: 'auto',
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
