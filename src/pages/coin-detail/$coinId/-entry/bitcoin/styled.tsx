import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const Container = styled('div')({
  width: '100%',
});

export const HistorySectionTitle = styled(Base1300Text)({
  textAlign: 'left',
});

export const HistoryContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1.2rem',
  boxSizing: 'border-box',
});

export const FooterContainer = styled('div')({
  position: 'relative',
});

export const FloatingButtonContainer = styled('div')({
  position: 'absolute',
  right: '2rem',
  bottom: '7rem',
});
