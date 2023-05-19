import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '0.4rem 1.6rem 1.6rem',

  height: '100%',

  position: 'relative',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const StyledInput = styled(Input)({
  height: '4.8rem',
});

export const Div = styled('div')({});

export const FeeContainer = styled('div')(({ theme }) => ({
  marginTop: '0.8rem',
  padding: '1.6rem',
  border: `0.1rem solid ${theme.colors.base03}`,

  borderRadius: '0.8rem',
}));

export const FeeInfoContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const FeeLeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  display: 'flex',
}));

export const FeeRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const FeeRightColumnContainer = styled('div')({});

export const FeeRightAmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text01,
}));

export const FeeRightValueContainer = styled('div')(({ theme }) => ({
  marginTop: '0.2rem',

  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text02,
}));
