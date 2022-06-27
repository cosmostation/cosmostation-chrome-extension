import { styled } from '@mui/material/styles';

import ChainButton from '~/Popup/components/ChainButton';
import ChainPopover from '~/Popup/components/ChainPopover';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',
});

export const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const StyledChainButton = styled(ChainButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  border: `0.1rem solid ${theme.colors.base04}`,

  '&:hover': {
    border: `0.1rem solid ${theme.colors.base03}`,
    backgroundColor: 'transparent',
  },
}));

export const StyledChainPopover = styled(ChainPopover)({
  '& .MuiPaper-root > div': {
    width: '32.8rem',
    maxHeight: '44rem',
  },
});

export const AddressBookList = styled('div')({
  marginTop: '1rem',

  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.8rem',

  maxHeight: '44.8rem',

  overflow: 'auto',
});

export const AddAddressBookButton = styled('button')(({ theme }) => ({
  padding: 0,
  border: 0,
  margin: 0,

  width: '100%',
  height: '9.2rem',

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

export const AddAddressBookImage = styled('div')(({ theme }) => ({
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

export const AddAddressBookText = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));
