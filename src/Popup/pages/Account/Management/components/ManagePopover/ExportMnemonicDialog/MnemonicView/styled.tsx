import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';

export const Container = styled('div')({
  padding: '1.0rem 0.8rem 1.6rem 0.8rem',
});

export const MnemonicContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
});

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

export const ButtonContainer = styled('div')({
  paddingLeft: '0.8rem',
  paddingRight: '0.8rem',
});

export const StyledButton = styled(Button)({
  marginTop: '2.4rem',
  height: '4rem',
});
