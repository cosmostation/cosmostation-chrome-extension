import { styled } from '@mui/material/styles';

import Base1000Text from '../common/Base1000Text';
import Base1300Text from '../common/Base1300Text';
import BottomSheet from '../common/BottomSheet';
import OutlinedChipButton from '../OutlinedChipButton';

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
  width: '8.2rem',
  height: '8.2rem',
  marginBottom: '1.6rem',
  '& > img': {
    width: '8.2rem',
    height: '8.2rem',
  },
});

export const TitleTextContainer = styled('div')({
  display: 'flex',
  maxWidth: '80%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const TitleText = styled(Base1300Text)({
  marginBottom: '0.6rem',
});

export const SubTitleText = styled(Base1000Text)({
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
    minHeight: '60%',
  },
});

export const StyledOutlinedChipButton = styled(OutlinedChipButton)({
  marginTop: '1.6rem',
});

export const JsonIconContainer = styled('div')({
  marginRight: '0.4rem',
});
