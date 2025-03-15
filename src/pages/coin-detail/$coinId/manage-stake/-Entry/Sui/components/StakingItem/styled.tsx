import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

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
  borderBottom: `0.2rem solid ${theme.palette.color.base300}`,
}));

export const TopLeftContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginLeft: '1rem',
  rowGap: '0.2rem',
});

export const ValidatorNameContainer = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  columnGap: '0.2rem',
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

export const ImageContainer = styled('div')({
  width: '3.2rem',
  height: '3.2rem',
  borderRadius: '50%',

  '& > img': {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
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

export const ValueAttributeText = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  color: theme.palette.color.base900,
}));

export const ValueText = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));
