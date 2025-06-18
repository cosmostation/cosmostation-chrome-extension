import { styled } from '@mui/material/styles';

import BaseCoinImage from '@/components/common/BaseCoinImage';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
});

export const StickyContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  padding: '0.8rem 1.2rem',

  backgroundColor: theme.palette.color.base50,
  boxSizing: 'border-box',
}));

export const RowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginTop: '1rem',
});

export const PurpleContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.palette.accentColor.purple400,
    '& > path': {
      fill: theme.palette.accentColor.purple400,
    },
  },
}));

export const ImportTextContainer = styled('div')(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
  marginLeft: '0.2rem',
}));

export const CoinButtonWrapper = styled('div')({
  width: '100%',
});

export const IconContainer = styled('div')({
  marginLeft: '0.6rem',
});

export const InfoIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base1300,
    '& > path': {
      fill: theme.palette.color.base1300,
    },
  },
}));

export const CoinContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: '0.8rem',
});

export const CoinImage = styled(BaseCoinImage)({
  width: '4.2rem',
  height: '4.2rem',
});

export const CoinSymbolContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: '0.2rem',
});

export const CoinIdContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0',
});
