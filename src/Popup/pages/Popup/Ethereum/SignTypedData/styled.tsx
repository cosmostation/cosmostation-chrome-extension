import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  position: 'relative',

  height: '100%',
});

export const ContentContainer = styled('div')({
  height: 'calc(100% - 16.8rem)',

  padding: '2rem 1.6rem 0',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  textAlign: 'center',
}));

export const NameContainer = styled('div')(({ theme }) => ({
  marginTop: '3rem',
  color: theme.colors.text01,

  textAlign: 'center',
}));

export const MessageContainer = styled('div')(({ theme }) => ({
  marginTop: '1.2rem',
  border: `0.1rem solid ${theme.colors.base03}`,
  borderRadius: '0.8rem',

  padding: '1.6rem',
}));

export const MessageTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const MessageContentContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  marginTop: '0.8rem',

  padding: '0.8rem',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  maxHeight: '23rem',

  overflow: 'auto',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',
  left: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const BottomButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
});
