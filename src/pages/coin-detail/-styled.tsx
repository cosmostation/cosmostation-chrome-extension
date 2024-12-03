import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import IconButton from '@/components/common/IconButton';
import OutlinedInput from '@/components/common/OutlinedInput';

export const Container = styled('div')({
  width: '100%',
});

export const HeaderRightContainer = styled('div')({
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  columnGap: '0.8rem',
});

export const FilterIconButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',

  width: '3.2rem',
  height: '3.2rem',

  borderRadius: '0.4rem',

  border: `0.1rem solid ${theme.palette.color.base200}`,
  backgroundColor: theme.palette.color.base100,
}));

export const FilterContaienr = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '0.6rem',
  marginBottom: '1.2rem',
});

export const StyledInput = styled(OutlinedInput)({
  height: '3.2rem',
});

export const CoinButtonWrapper = styled('div')({
  width: '100%',
});

export const StickyContentsContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const SectionWrapper = styled('div')(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: `0.4rem solid ${theme.palette.color.base100} `,
  },
}));

export const SectionContainer = styled('div')(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: `0.4rem solid ${theme.palette.color.base100} `,
  },
}));

export const SectionStickyContainer = styled('div')({
  width: '100%',
  position: 'sticky',
  top: '3rem',
  zIndex: 1,

  boxSizing: 'border-box',

  padding: '1.6rem',
});

export const HistorySectionTitle = styled(Base1300Text)({
  textAlign: 'left',
});
