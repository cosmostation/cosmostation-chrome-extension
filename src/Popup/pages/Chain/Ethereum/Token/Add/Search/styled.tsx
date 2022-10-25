import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

import Search20Icon from '~/images/icons/Search20.svg';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.9rem 1.6rem 0',
  position: 'relative',
  overflow: 'hidden',
});

export const Div = styled('div')({});

export const WarningContainer = styled('div')({
  padding: '1.2rem 1.6rem',
  display: 'flex',

  backgroundColor: 'rgba(205, 26, 26, 0.15)',
  borderRadius: '0.8rem',

  marginBottom: '1.6rem',
});

export const WarningIconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.accentColors.red,

    '& > path': {
      fill: theme.accentColors.red,
    },
  },
}));

export const WarningTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.colors.text01,
}));

export const ImportCustomTokenButton = styled('button')(({ theme }) => ({
  padding: 0,
  border: 0,
  marginBottom: '1.2rem',

  width: '100%',
  height: '4rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base02,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '&:hover': {
    backgroundColor: theme.colors.base03,
    cursor: 'pointer',
  },
}));

export const ImportCustomTokenImage = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginRight: '0.4rem',

  '& > svg': {
    '& > path': {
      fill: theme.accentColors.purple01,
    },
  },
}));

export const ImportCustomTokenText = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const ButtonContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const ListContainer = styled('div')({
  overflow: 'auto',
  height: '22.7rem',
});

export const TokenList = styled('div')({
  marginTop: '1.2rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.4rem',

  overflow: 'auto',
});

export const StyledSearch20Icon = styled(Search20Icon)(({ theme }) => ({
  fill: theme.colors.base05,
}));

export const StyledInput = styled(Input)({
  height: '4rem',
});
