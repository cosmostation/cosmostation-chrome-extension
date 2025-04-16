import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';
import BottomSheet from '@/components/common/BottomSheet';

export const Container = styled('div')({
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '1.6rem',

  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,

  flexShrink: 0,
}));

export const HeaderTitle = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.4rem',
});

export const ChainImage = styled(BaseChainImage)({
  width: '2.4rem',
  height: '2.4rem',
});

export const Body = styled('div')({
  width: '100%',
});

export const DescriptionContainer = styled('div')(({ theme }) => ({
  width: '100%',
  padding: '1.2rem 1.6rem',
  color: theme.palette.color.base1100,
  boxSizing: 'border-box',
}));

export const CoinTypeContainer = styled('div')({
  width: '100%',
  padding: '1.2rem',
  boxSizing: 'border-box',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '70%',
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
    fill: theme.palette.color.base400,
  },
}));
