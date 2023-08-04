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

export const StyledTextarea = styled(Input)({
  margin: '0.8rem 0 1.2rem',
});

export const Div = styled('div')({});

export const AddressContainer = styled('div')({
  marginTop: '0.8rem',

  display: 'flex',
  alignItems: 'center',

  padding: '0.6rem 1.2rem',

  backgroundColor: 'rgba(39, 189, 105, 0.15)',

  borderRadius: '0.6rem',

  columnGap: '0.4rem',
});

export const CheckAddressIconContainer = styled('div')({
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  width: '1.6rem',
  height: '1.6rem',
});

export const Address = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  wordBreak: 'break-all',
}));
