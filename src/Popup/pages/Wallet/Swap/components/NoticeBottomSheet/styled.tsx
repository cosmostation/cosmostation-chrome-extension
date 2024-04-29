import { styled } from '@mui/material/styles';

import BottomSheet from '~/Popup/components/common/BottomSheet';

export const Container = styled('div')({
  padding: '1.6rem',
  overflow: 'hidden',

  display: 'flex',
  flexDirection: 'column',
});

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  flexShrink: 0,

  paddingBottom: '1.6rem',

  borderBottom: `0.1rem solid ${theme.colors.base03}`,
}));

export const HeaderTitle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  columnGap: '1rem',

  color: theme.colors.text01,
}));

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    maxHeight: '55rem',

    width: '36rem',

    borderRadius: 0,
  },
});

export const ContentContainer = styled('div')({});

export const Footer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
});
