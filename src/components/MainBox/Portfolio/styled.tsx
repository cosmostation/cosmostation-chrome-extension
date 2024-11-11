import IconTextButton from '@/components/IconTextButton';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

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

export const TopRightText = styled(Typography)(({ theme }) => ({
  margin: '0 0.2rem',

  color: theme.palette.color.base1300,
}));

export const BodyContainer = styled('div')({});
export const BodyTopContainer = styled('div')({});

export const BodyBottomContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
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

export const ChevronIconContainer = styled('div')({
  width: '1.2rem',
  height: '1.2rem',

  '& > svg': {
    width: '1.2rem',
    height: '1.2rem',
  },
});
