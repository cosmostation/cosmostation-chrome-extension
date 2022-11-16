import { styled } from '@mui/material/styles';

import BottomSheet from '~/Popup/components/common/BottomSheet';

export const Container = styled('div')({
  padding: '1.6rem 1.6rem 0',
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

export const AddressList = styled('div')({
  marginTop: '1.6rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  overflow: 'auto',

  paddingBottom: '0.8rem',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    maxHeight: '44rem',
  },
});
