import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '0.4rem 1.6rem 1.6rem',

  height: '100%',

  position: 'relative',
});

export const MaxButton = styled('button')(({ theme }) => ({
  padding: '0.4rem 0.8rem',
  border: 0,
  borderRadius: '5rem',

  marginLeft: '0.8rem',

  height: 'max-content',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.accentColors.purple01,
  color: theme.accentColors.white,

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.accentColors.purple02,
  },
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const StyledInput = styled(Input)({
  height: '4.8rem',
});

export const Div = styled('div')({});
