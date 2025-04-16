import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1000Text from '@/components/common/Base1000Text';
import BaseCoinImage from '@/components/common/BaseCoinImage';
import BottomSheet from '@/components/common/BottomSheet';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '1.6rem',

  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,

  flexShrink: 0,
}));

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const Body = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',

  flex: 1,
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',

  width: '100%',
  flex: 1,
  rowGap: '2.6rem',
  padding: '1.6rem',
});

export const DescriptionItemContainer = styled('div')({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  columnGap: '0.8rem',
});

export const LabelText = styled(Typography)(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
}));

export const DescriptionContentsContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.2rem',
});

export const TextWrapContainer = styled('div')({
  width: '85%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  rowGap: '0.2rem',
});

export const ImageContainer = styled('div')({
  width: '3.6rem',
  height: '3.6rem',
  '& > img': {
    width: '3.6rem',
    height: '3.6rem',
  },
});

export const SubTitleText = styled(Base1000Text)({
  width: '80%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  whiteSpace: 'pre-wrap',
  textAlign: 'center',
});

export const StakingInfoContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  rowGap: '1rem',
  padding: '1.6rem',
  backgroundColor: theme.palette.color.base100,
  boxSizing: 'border-box',
  borderRadius: '0.6rem',
  marginBottom: '1.2rem',
}));

export const StakingInfoItem = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  columnGap: '1rem',
  marginRight: '1.2rem',

  '&:not(:last-child)': {
    borderRight: `0.1rem solid ${theme.palette.color.base200}`,
  },
}));

export const StakingInfoRightItem = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.4rem',
});

export const Footer = styled('div')({
  marginTop: 'auto',
  padding: '1.2rem',
});

export const CoinImage = styled(BaseCoinImage)({
  width: '3.2rem',
  height: '3.2rem',
});

export const GreenText = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  color: theme.palette.accentColor.green400,
}));

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '75%',
  },
});

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: 0,
  margin: 0,
  border: 0,

  height: '2.4rem',

  cursor: 'pointer',

  '& > svg': {
    fill: theme.palette.color.base400,
  },
}));
