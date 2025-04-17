import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';

export const Container = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1rem',
});

export const FeeRowWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.6rem',
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

export const LabelLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.2rem',

  color: theme.palette.color.base900,
  '& > svg': {
    fill: theme.palette.color.base900,
  },
}));

export const IconContainer = styled('div')({
  width: '1.4rem',
  height: '1.4rem',

  '& > svg': {
    width: '1.4rem',
    height: '1.4rem',
  },
});

export const ChainImageContainer = styled(BaseChainImage)({
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
  '&:disabled': {
    '&:hover': {
      opacity: '1',
    },
  },
}));

export const Base900FeeCustomButton = styled(FeeCustomButton)(({ theme }) => ({
  color: theme.palette.color.base900,
}));

export const AdditionalFeeAmount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.color.base900,
}));

export const Base900Text = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base900,
}));

export const TotalValue = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

type EstimatedFeeTextContainerProps = {
  'data-is-disabled'?: boolean;
};

export const EstimatedFeeTextContainer = styled('div')<EstimatedFeeTextContainerProps>(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'baseline',

  borderBottom: props['data-is-disabled'] ? 'none' : `0.1rem solid ${theme.palette.color.base1300}`,
}));

export const AdditionalEstimatedFeeTextContainer = styled(EstimatedFeeTextContainer)<EstimatedFeeTextContainerProps>(({ theme, ...props }) => ({
  borderBottom: props['data-is-disabled'] ? 'none' : `0.1rem solid ${theme.palette.color.base900}`,
}));
