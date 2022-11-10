import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

// REVIEW 내용이 없는 빈 div는 어떻게 처리해야할까요?
export const Container = styled('div')({
  // padding: '0',
  // height: '100%',
  // position: 'relative',
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

export const StyledTextarea = styled(Input)({});

export const MarginTop8Div = styled('div')({
  marginTop: '0.8rem',
});

export const MarginTop12Div = styled('div')({
  marginTop: '1.2rem',
});

export const MarginTop16Div = styled('div')({
  marginTop: '1.6rem',
});
