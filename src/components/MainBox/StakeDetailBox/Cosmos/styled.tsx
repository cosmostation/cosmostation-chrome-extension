import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: '1.2rem',
});

export const BodyContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1rem',
});

export const BodyContentsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const AmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  color: theme.palette.color.base1300,
}));

export const BottomButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',

  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.01)',
  backdropFilter: 'blur(0.4rem)',
  WebkitBackdropFilter: 'blur(0.4rem)',

  marginTop: '1.8rem',

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

export const SpacedTypography = styled(Base1300Text)({
  marginTop: '0.4rem',
});
