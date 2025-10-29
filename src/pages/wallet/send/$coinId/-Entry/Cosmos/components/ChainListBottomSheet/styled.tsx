import { styled } from '@mui/material/styles';

import BottomSheet from '@/components/common/BottomSheet';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '1.6rem',

  flexShrink: 0,
});

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const Body = styled('div')({
  width: '100%',
  height: '100%',
  overflow: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

export const ChainButtonWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
});

export const VirtualizedListContainer = styled('div')({
  flex: '1',
  width: '100%',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    height: '85%',
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

export const FilterContainer = styled('div')({
  width: '100%',

  padding: '0 1.2rem 1.2rem',

  boxSizing: 'border-box',
});

export const ChevronIconContainer = styled('div')(({ theme }) => ({
  width: '1.4rem',
  height: '1.4rem',

  '& > svg': {
    width: '1.4rem',
    height: '1.4rem',

    fill: theme.palette.color.base800,

    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));

export const ChainNameContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.4rem',
});

export const IBCBadge = styled('div')(({ theme }) => ({
  width: 'fit-content',
  padding: '0.2rem 0.8rem',
  border: `0.1rem solid ${theme.palette.accentColor.green300}`,
  borderRadius: '1rem',
}));
