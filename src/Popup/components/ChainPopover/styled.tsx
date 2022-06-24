import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';
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

export const ChainListContainer = styled('div')({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
  rowGap: '0.4rem',
});

export const StyledDivider = styled(Divider)({
  margin: '1.6rem 0',
});

export const ChainTitleContainer = styled('div')(({ theme }) => ({
  marginBottom: '1.6rem',

  color: theme.colors.text02,

  display: 'flex',
  alignItems: 'center',
}));
