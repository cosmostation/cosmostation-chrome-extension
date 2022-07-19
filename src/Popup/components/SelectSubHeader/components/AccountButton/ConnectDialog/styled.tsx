import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';

export const Container = styled('div')({ padding: '1.6rem' });

export const OriginContainer = styled('div')(({ theme }) => ({
  padding: '1.2rem',
  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  maxWidth: '100%',
  overflow: 'hidden',
}));

export const OriginImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginRight: '0.8rem',

  flexShrink: 0,

  width: '1.4rem',
  height: '1.4rem',

  '& > img': {
    width: '1.4rem',
    height: '1.4rem',
  },
});

export const OriginTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  overflow: 'auto',

  color: theme.colors.text01,

  '& > *': {
    width: '100%',
  },
}));

export const DescriptionContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  textAlign: 'center',

  margin: '1.6rem 0 2rem',
}));

export const StyledButton = styled(Button)({
  height: '4rem',
});
