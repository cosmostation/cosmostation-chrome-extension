import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  position: 'relative',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const MnemonicContainer = styled('div')(({ theme }) => ({
  padding: '0.8rem',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',

  borderRadius: '0.8rem',
  backgroundColor: theme.colors.base02,
}));

export const MnemonicWordContainer = styled('div')({
  paddingLeft: '0.8rem',
  display: 'flex',
  alignItems: 'center',

  height: '2.4rem',

  wordBreak: 'break-all',
});

export const MnemonicWordNumberContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.accentColors.purple01,

  width: '1.7rem',
}));
export const MnemonicWordTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textAlign: 'left',

  color: theme.colors.text01,

  marginLeft: '0.4rem',
}));
