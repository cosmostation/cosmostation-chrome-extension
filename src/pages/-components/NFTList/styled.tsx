import { Typography as BaseTypography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Contaienr = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  flex: '1',
});

export const StickyTabPanelContentsContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '7.8rem',

  padding: '0 1.2rem 0.8rem ',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const FilterContaienr = styled('div')({
  width: '100%',
  marginTop: '0.8rem',
});

export const ManageCryptoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',

  marginTop: '1.2rem',
});

export const MarginLeftTypography = styled(BaseTypography)(({ theme }) => ({
  marginLeft: '0.4rem',

  color: theme.palette.color.base1300,
}));

export const NFTItemWrapper = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  flex: '1',
});

export const NFTGridContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
  gridAutoRows: 'minmax(20.7rem, auto)',
  rowGap: '1.6rem',
  columnGap: '1rem',
  padding: '0 1.2rem 1.2rem',
});

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0',
});
