import { styled } from '@mui/material/styles';

import BottomSheet from '~/Popup/components/common/BottomSheet';

export const Container = styled('div')({
  padding: '1.6rem',
  overflow: 'hidden',

  display: 'flex',
  flexDirection: 'column',
});

export const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  flexShrink: 0,
});

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    maxHeight: '44rem',

    width: '36rem',

    borderRadius: 0,
  },
});

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: 0,
  margin: 0,
  border: 0,

  height: '2.4rem',

  cursor: 'pointer',

  '& > svg': {
    fill: theme.colors.base05,
  },
}));

export const ContentContainer = styled('div')({
  padding: '1.6rem',
});

export const Footer = styled('div')({});
