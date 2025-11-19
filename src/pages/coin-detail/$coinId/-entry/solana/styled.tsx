import { styled } from '@mui/material/styles';

import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1300Text from '@/components/common/Base1300Text';

export const StyledEdgeAligner = styled(EdgeAligner)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

export const HistorySectionTitle = styled(Base1300Text)({
  textAlign: 'left',
});

export const HistoryContainer = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
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
