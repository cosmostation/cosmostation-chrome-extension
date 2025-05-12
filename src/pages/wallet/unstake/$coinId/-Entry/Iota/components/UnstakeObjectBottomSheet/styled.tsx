import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import BottomSheet from '@/components/common/BottomSheet';
import ValidatorImage from '@/components/common/ValidatorImage';

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

  flexShrink: 0,
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
}));

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const Body = styled('div')({
  width: '100%',
  overflow: 'auto',
  padding: '1.2rem',
  boxSizing: 'border-box',
});

export const ButtonWrapper = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.8rem',
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
  rowGap: '0.5rem',
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
