import { styled } from '@mui/material/styles';

import Base1300Text from '../common/Base1300Text';

export const Container = styled('div')({});

export const TopContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.8rem',
});

export const MnemonicContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',

  gap: '0.6rem',

  borderRadius: '0.8rem',
  backgroundColor: 'transparent',

  marginTop: '0.8rem',
});

export const MarginRightTypography = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const ViewIconContainer = styled('div')({
  width: '1.6rem',
  height: '1.6rem',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

export const BottomChevronIconContainer = styled('div')({
  width: '1.4rem',
  height: '1.4rem',

  '& > svg': {
    width: '1.4rem',
    height: '1.4rem',
  },
});
