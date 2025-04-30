import { styled } from '@mui/material/styles';

import ValidatorImage from '@/components/common/ValidatorImage';

export const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',
  border: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.palette.color.base100,

  borderRadius: '0.8rem',

  cursor: 'pointer',

  padding: '1.2rem',

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const TopContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingBottom: '1.2rem',
  borderBottom: `0.1rem solid ${theme.palette.color.base300}`,
}));

export const TopLeftContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginLeft: '1rem',
  rowGap: '0.2rem',
});

export const ValidatorNameWrapper = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  columnGap: '0.2rem',
});

export const ValidatorNameContainer = styled('div')({
  display: 'flex',
  maxWidth: '12rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const RightChevronIconContainer = styled('div')(({ theme }) => ({
  width: '1.4rem',
  height: '1.4rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base600,
    '& > path': {
      fill: theme.palette.color.base600,
    },
  },
}));

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

export const StakingInfoContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.8rem',
  marginTop: '1.2rem',
});

export const StakingInfoRowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const AmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  color: theme.palette.color.base1300,
}));
