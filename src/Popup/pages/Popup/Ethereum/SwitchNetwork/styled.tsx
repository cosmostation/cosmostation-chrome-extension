import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

export const Container = styled('div')({
  position: 'relative',

  height: '100%',
});

export const SwitchIconContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const QuestionContainer = styled('div')(({ theme }) => ({
  marginTop: '1.2rem',
  color: theme.colors.text01,

  textAlign: 'center',

  wordBreak: 'break-word',

  padding: '0 4rem',
}));

export const DescriptionContainer = styled('div')(({ theme }) => ({
  marginTop: '1rem',
  color: theme.colors.text02,

  textAlign: 'center',

  wordBreak: 'break-word',

  padding: '0 2rem',
}));

export const ChainInfoContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',
  padding: '2rem 3rem',

  backgroundColor: theme.colors.base02,
  color: theme.colors.text01,

  borderRadius: '0.8rem',
}));

export const StyledDivider = styled(Divider)({
  margin: '2rem 0',
});

export const ContentContainer = styled('div')({
  height: 'calc(100% - 16.8rem)',

  padding: '2rem 1.6rem 0',
});

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
