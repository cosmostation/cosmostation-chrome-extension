import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')({
  width: '100%',
  maxHeight: '100%',

  padding: '0 1.2rem 0 1.2rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
});

export const Panel = styled('div')(({ theme }) => ({
  width: '100%',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  padding: '1.6rem',
}));

export const TitleAreaContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const ButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > button:nth-of-type(n + 2)': {
    marginLeft: '0.4rem',
  },
});

export const AddressContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  wordBreak: 'break-all',

  marginTop: '0.4rem',
}));

export const QRContentContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginTop: '2rem',
});

export const QRContainer = styled('div')(({ theme }) => ({
  padding: '0.8rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.accentColors.white,
}));

export const StyledIconButton = styled(IconButton)({
  padding: '0.4rem',
  margin: '-0.4rem',
});
