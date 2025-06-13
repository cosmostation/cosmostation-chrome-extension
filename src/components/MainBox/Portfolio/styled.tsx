import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import BaseCoinImage from '@/components/common/BaseCoinImage';
import ChipButton from '@/components/common/ChipButton';
import IconTextButton from '@/components/common/IconTextButton';

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

export const TopLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  columnGap: '0.2rem',

  color: theme.palette.color.base1300,
  height: 'fit-content',
}));

export const ViewTotalValueText = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const ViewIconContainer = styled('div')({
  width: '1.4rem',
  height: '1.4rem',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});

export const TopRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',

  color: theme.palette.color.base1300,
}));

export const BodyContainer = styled('div')({});

export const BodyTopContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  margin: '0.4rem 0 0.2rem',

  columnGap: '0.4rem',

  color: theme.palette.color.base1300,
}));

export const TotalBalanceContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',

  color: theme.palette.color.base1300,
}));

export const StyledIconContainer = styled('div')({
  width: '1.2rem',
  height: '1.2rem',

  marginLeft: '0.2rem',

  '& > svg': {
    width: '1.2rem',
    height: '1.2rem',
  },
});

export const BodyBottomContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  marginBottom: '1.4rem',
});

export const BodyBottomChipButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  columnGap: '0.6rem',
});

export const BottomButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',

  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.01)',
  backdropFilter: 'blur(0.4rem)',
  WebkitBackdropFilter: 'blur(0.4rem)',

  borderTop: '0.1rem solid rgba(255, 255, 255, 0.01)',
  borderBottom: '0.1rem solid rgba(255, 255, 255, 0.01)',
});

export const StyledIconTextButton = styled(IconTextButton)({
  width: '100%',

  padding: '1.3rem 0',
  '&:not(:last-child)': {
    borderRight: '0.1rem solid rgba(255, 255, 255, 0.01)',
  },
});

export const SpacedTypography = styled(Typography)(({ theme }) => ({
  marginTop: '0.4rem',

  color: theme.palette.color.base1300,
}));

export const StyledCoinImageContainer = styled(BaseCoinImage)(() => {
  return {
    width: '1.4rem',
    height: '1.4rem',
  };
});

export const ChipButtonContentsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.4rem',
});

export const StyledChipButton = styled(ChipButton)({
  padding: '0.5rem 0.8rem',
});
