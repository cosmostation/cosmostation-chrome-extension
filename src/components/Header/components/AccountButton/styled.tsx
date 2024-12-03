import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const StyledButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  width: 'fit-content',
  height: 'fit-content',

  cursor: 'pointer',

  padding: '0',
  border: 'none',
  background: 'none',

  color: theme.palette.color.base1000,

  '&:hover': {
    opacity: '0.8',
  },
}));

export const AccountText = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.2rem',
  height: '1.2rem',

  '& > svg': {
    width: '1.2rem',
    height: '1.2rem',
    fill: theme.palette.color.base800,

    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));
