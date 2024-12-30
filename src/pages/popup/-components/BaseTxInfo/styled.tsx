import { styled } from '@mui/material/styles';

import Image from '@/components/common/Image';

export const Container = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1rem',
});

export const RowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const RowLeftContainer = styled('div')({});

export const RowRightContainer = styled('div')({});

export const ChainContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',
});

export const ChainImageContainer = styled(Image)({
  width: '1.8rem',
  height: '1.8rem',
});

export const FeeCustomButton = styled('button')(({ theme }) => ({
  display: 'flex',

  backgroundColor: 'transparent',

  padding: '0',

  border: 'none',

  color: theme.palette.color.base1300,

  cursor: 'pointer',

  '&:hover': {
    opacity: '0.8',
  },
}));

export const EstimatedFeeTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',

  borderBottom: `0.1rem solid ${theme.palette.color.base1300}`,
}));
