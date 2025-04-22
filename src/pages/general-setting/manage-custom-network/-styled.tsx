import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';

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

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const RowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginTop: '1rem',
});

export const NetworkCounts = styled('span')(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const PurpleContainer = styled('div')(({ theme }) => ({
  width: '1.2rem',
  height: '1.2rem',

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

export const ButtonWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  flex: '1',
});

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const ChainImage = styled(BaseChainImage)({
  width: '3.6rem',
  height: '3.6rem',
  marginRight: '-0.6rem',
});

export const ChipButtonContentsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  marginLeft: '0.4rem',
  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.color.base1000,

    '& > path': {
      fill: theme.palette.color.base1000,
    },
  },
}));
