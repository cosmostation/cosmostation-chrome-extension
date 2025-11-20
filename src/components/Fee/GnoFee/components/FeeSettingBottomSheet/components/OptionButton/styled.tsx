import { styled } from '@mui/material/styles';

type StyledOptionButtonProps = {
  isActive: boolean;
};

export const StyledOptionButton = styled('button')<StyledOptionButtonProps>(({ theme, ...props }) => ({
  width: '100%',
  padding: '2.2rem 1.6rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  border: 'none',

  color: theme.palette.color.base1300,
  backgroundColor: props['isActive'] ? theme.palette.color.base200 : 'transparent',

  '&:hover': {
    backgroundColor: theme.palette.color.base100,
  },
}));

export const LeftContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.3rem',
});

export const LeftBottomContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const AmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  color: theme.palette.color.base1300,
}));

export const ValueContainer = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const RightContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  rowGap: '0.3rem',
});

export const ActiveBadge = styled('div')({
  width: '1.5rem',
  height: '1.5rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '50%',

  background: 'rgba(124, 79, 252, 1)',
});
