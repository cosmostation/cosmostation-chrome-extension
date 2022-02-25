import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',
});

export const ListContainer = styled('div')({
  // TODO: grid 로 변경
  '& > :nth-of-type(n + 2)': {
    marginTop: '0.8rem',
  },

  width: '100%',
  height: 'calc(100% - 8rem)',

  overflow: 'auto',
});

export const ButtonContainer = styled('div')({
  width: '100%',
  height: '8rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const StyledButton = styled(Button)({});
