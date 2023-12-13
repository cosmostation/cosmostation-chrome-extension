import { styled } from '@mui/material/styles';

import BottomSheet from '~/Popup/components/common/BottomSheet';
import Input from '~/Popup/components/common/Input';

import Search20Icon from '~/images/icons/Search20.svg';

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

export const StyledSearch20Icon = styled(Search20Icon)(({ theme }) => ({
  fill: theme.colors.base05,
}));

export const StyledInput = styled(Input)({
  height: '4rem',
  margin: '1.6rem 0',
});

export const AssetList = styled('div')({
  margin: '0 -1.6rem',
  padding: '0 1.6rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  overflow: 'auto',

  paddingBottom: '0.8rem',
});

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
