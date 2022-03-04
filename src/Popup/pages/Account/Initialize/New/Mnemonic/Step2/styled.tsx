import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 2.4rem 0',

  position: 'relative',
});

export const MnemonicTitleContainer = styled('div')({
  width: '100%',
  height: '2.4rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginTop: '2rem',
});

export const MnemonicTitleLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const MnemonicTitleRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > :nth-of-type(n + 2)': {
    marginLeft: '0.4rem',
  },
});

export const MnemonicContainer = styled('div')(({ theme }) => ({
  padding: '0.8rem',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',

  borderRadius: '0.8rem',
  backgroundColor: theme.colors.base02,

  marginTop: '1.2rem',
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

export const CopyButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  width: '100%',

  marginTop: '1.2rem',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 4.8rem)',

  bottom: '2.4rem',
});

export const BottomSettingButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginBottom: '2.4rem',
});
