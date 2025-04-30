import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import ValidatorImage from '@/components/common/ValidatorImage';

export const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.palette.color.base100,

  borderRadius: '0.8rem',
  padding: '0',

  cursor: 'pointer',

  border: `0.1rem solid ${theme.palette.color.base200}`,

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
    '&: disabled': {
      backgroundColor: theme.palette.color.base100,
    },
  },
}));

export const TopContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '5.8rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.2rem',
  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
  boxSizing: 'border-box',
}));

export const TopLeftContentsContainer = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
});

export const TopLeftContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginLeft: '1rem',
  rowGap: '0.2rem',
});

type ChevronIconContainer = {
  'data-is-open': boolean;
};

export const ChevronIconContainer = styled('div')<ChevronIconContainer>(({ ...props }) => {
  return {
    width: '1.2rem',
    height: '1.2rem',
    transform: props['data-is-open'] ? 'rotate(180deg)' : 'rotate(0deg)',

    '& svg': {
      width: '100%',
      height: '100%',
    },
  };
});

export const ValidatorNameContainer = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  columnGap: '0.2rem',
});

export const StyledValidatorImage = styled(ValidatorImage)({
  width: '3.2rem',
  height: '3.2rem',

  '& > img': {
    width: '100%',
    height: '100%',
  },
});

export const CommissionContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const StakingInfoContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.8rem',
  backgroundColor: theme.palette.color.base50,
  padding: '1.2rem',
  boxSizing: 'border-box',
}));

export const StakingInfoTitleRowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

export const StakingInfoTitleRowRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.2rem',
  alignItems: 'flex-end',
  color: theme.palette.color.base1000,
}));

export const StakingInfoRowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const StakingInfoDetailContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.4rem',
});

export const AmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  color: theme.palette.color.base1300,
}));

export const LabelLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.6rem',

  '& > svg': {
    fill: theme.palette.color.base900,
  },
}));

export const LabelText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const LabelAttributeText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base900,
}));

export const ValueAttributeText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base900,
}));

export const ValueText = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));
