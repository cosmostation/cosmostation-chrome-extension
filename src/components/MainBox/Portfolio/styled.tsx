import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import IconButton from '@/components/common/IconButton';
import IconTextButton from '@/components/common/IconTextButton';

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const TopLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  columnGap: '0.2rem',

  color: theme.palette.color.base1300,
}));

export const TopRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',

  color: theme.palette.color.base1300,
}));

export const HistoryButtonTypo = styled(Typography)(({ theme }) => ({
  marginLeft: '0.2rem',

  color: theme.palette.color.base1300,
}));

export const BodyContainer = styled('div')({});

export const BodyTopContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  margin: '1rem 0 0.2rem',

  columnGap: '0.4rem',

  color: theme.palette.color.base1300,
}));

export const TotalBalanceContainer = styled('div')({
  display: 'flex',
  alignItems: 'baseline',
});

export const StyledIconButton = styled(IconButton)({
  width: '1.2rem',
  height: '1.2rem',

  '& > svg': {
    width: '1.2rem',
    height: '1.2rem',
  },
});

export const BodyBottomContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
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
  backdropFilter: 'blur(1rem)',
  WebkitBackdropFilter: 'blur(1rem)',

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
