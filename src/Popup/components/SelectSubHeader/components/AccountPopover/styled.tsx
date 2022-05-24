import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')(({ theme }) => ({
  width: '33.6rem',
  maxHeight: '49.7rem',
  overflow: 'auto',

  color: theme.colors.text01,
}));

export const HeaderContainer = styled('div')({
  height: '4.2rem',
  width: '100%',

  padding: '0 1.6rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const HeaderLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const HeaderRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const BodyContainer = styled('div')({
  padding: '1.6rem',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  marginRight: '-1.2rem',

  '& > svg > path': {
    fill: theme.colors.base05,
  },
}));

export const AccountListContainer = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.4rem',
});
