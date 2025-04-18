import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const Body = styled('div')({
  paddingTop: '1.2rem',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',

  width: '100%',

  rowGap: '0.6rem',

  padding: '0.4rem 0.4rem 0',
});

export const DescriptionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const DescriptionSubTitle = styled(Typography)(({ theme }) => ({
  width: '95%',

  color: theme.palette.color.base1000,
}));

export const TopContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.8rem',
});

export const ViewIconContainer = styled('div')({
  width: '1.6rem',
  height: '1.6rem',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

export const PrivateKeyViewerContainer = styled('div')({
  marginTop: '2rem',
});

export const CopyContainer = styled('div')({
  display: 'flex',

  marginBottom: '0.8rem',
});

export const ControlInputButtonContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  marginTop: '1.2rem',
});

export const CopyText = styled(Typography)(({ theme }) => ({
  marginLeft: '0.2rem',
  color: theme.palette.color.base1100,
}));

export const MarginRightTypography = styled(Base1300Text)({
  marginRight: '0.2rem',
});
