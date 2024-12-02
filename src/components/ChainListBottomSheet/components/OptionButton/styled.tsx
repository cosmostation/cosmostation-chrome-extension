import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';

export const StyledChainButton = styled('button')(({ theme }) => ({
  width: '100%',
  padding: '2.2rem 1.6rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  border: 'none',

  color: theme.palette.color.base1300,
  backgroundColor: 'transparent',

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const LeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.6rem',
});

export const ChainImage = styled(Image)({
  width: '3.6rem',
  height: '3.6rem',
});

export const ChainNameText = styled(Base1300Text)({});

export const ActiveBadge = styled('div')(({ theme }) => ({
  width: '1.5rem',
  height: '1.5rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '50%',

  background: theme.palette.accentColor.purple200,
}));
