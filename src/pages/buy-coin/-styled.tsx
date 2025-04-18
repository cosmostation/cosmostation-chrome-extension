import { styled } from '@mui/material/styles';

import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1300Text from '@/components/common/Base1300Text';

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',

  width: '100%',

  rowGap: '0.6rem',

  margin: '1.6rem 0.4rem 2rem',
});

export const DescriptionTitle = styled(Base1300Text)({});

export const DescriptionSubTitle = styled(Base1300Text)(({ theme }) => ({
  width: '95%',
  color: theme.palette.color.base1000,
}));

export const ContentsContainer = styled('div')({
  width: '100%',
});

export const LabelContainer = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  columnGap: '0.2rem',

  marginBottom: '0.8rem',
});

export const OptionButtonWrapper = styled(EdgeAligner)({
  display: 'flex',
  flexDirection: 'column',
});

export const FooterContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  columnGap: '0.4rem',

  marginBottom: '4rem',
});
