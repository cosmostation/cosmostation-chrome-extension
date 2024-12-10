import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const MainContentsContainer = styled('div')({
  marginTop: '1.6rem',
});

export const OptionButtonContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  margin: '1.6rem 0 2.4rem',
});

export const MainContentBody = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: '0.4rem',
});

export const MainContentTitleText = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const MainContentSubtitleText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const AccountImgContainer = styled('div')({
  width: '5.4rem',
  height: '5.4rem',

  background: 'gray',
});
