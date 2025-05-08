import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1000Text from '@/components/common/Base1000Text';
import ValidatorImage from '@/components/common/ValidatorImage';

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

export const StyledValidatorImage = styled(ValidatorImage)({
  width: '3.2rem',
  height: '3.2rem',

  '& > img': {
    width: '100%',
    height: '100%',
  },
});

export const ValidatorNameContainer = styled('div')({
  display: 'flex',

  maxWidth: '14rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
export const StakingInfoContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.7rem',
  boxSizing: 'border-box',
});

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
  rowGap: '0.8rem',
});

export const AmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  color: theme.palette.color.base1300,
}));

export const LabelLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const LabelText = styled(Base1000Text)();

export const LabelAttributeText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const ValueText = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));
