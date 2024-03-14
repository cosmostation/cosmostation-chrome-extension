import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '0 0.4rem',
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

export const LeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const LeftImageContainer = styled('div')({
  width: '2.8rem',
  height: '2.8rem',

  '& > img': {
    width: '2.8rem',
    height: '2.8rem',
  },
});

export const LeftInfoContainer = styled('div')({
  marginLeft: '0.6rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const LeftHeaderTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));
