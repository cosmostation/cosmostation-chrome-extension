import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '2.1rem 1.6rem 1.6rem 1.6rem',
});

export const DescriptionContainer = styled('div')(({ theme }) => ({
  width: '100%',

  color: theme.colors.text01,
}));

export const InfoContainer = styled('div')(({ theme }) => ({
  padding: '1.2rem 1.6rem',
  width: '100%',

  maxHeight: '12rem',

  overflow: 'auto',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  marginTop: '1.6rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.4rem',
}));

export const InfoItemContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  height: '2.2rem',
});

export const InfoItemLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  color: theme.colors.text02,
}));

export const InfoItemRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  color: theme.colors.text01,

  '& > *': {
    maxWidth: '15rem',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

export const InfoItemRightAccentSpan = styled('span')(({ theme }) => ({
  color: theme.accentColors.purple01,
}));

export const InputContainer = styled('div')({
  marginTop: '2.4rem',
  width: '100%',
});

export const StyledInput = styled(Input)({
  height: '4rem',
  width: '100%',
});

export const StyledButton = styled(Button)({
  marginTop: '2.4rem',
  height: '4rem',
});
