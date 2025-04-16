import { styled } from '@mui/material/styles';

import Base1000Text from '../common/Base1000Text';
import BottomSheet from '../common/BottomSheet';

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
  alignItems: 'center',

  flex: 1,
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  width: '100%',
  flex: 1,
});

export const ImageContainer = styled('div')({
  width: 'fit-content',
  height: 'fit-content',
  marginBottom: '1.6rem',
  '& > img': {
    width: 'fit-content',
    height: 'fit-content',
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

export const Footer = styled('div')({
  marginTop: 'auto',
  padding: '1.2rem',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '50%',
  },
});
