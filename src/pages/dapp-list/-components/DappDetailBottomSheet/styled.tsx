import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';
import BottomSheet from '@/components/common/BottomSheet';
import Image from '@/components/common/Image';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
});

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
  margin: '1.6rem 0',
}));

export const DappDescriptionContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.6rem',
  marginTop: '1.6rem',
  boxSizing: 'border-box',
});

export const DappTopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const DappNameContainer = styled('div')({
  display: 'flex',
  columnGap: '0.6rem',
  alignItems: 'center',
});

export const TypeBadge = styled('div')(({ theme }) => ({
  padding: '0.2rem 0.5rem',
  backgroundColor: theme.palette.accentColor.purple100,
  borderRadius: '0.2rem',
}));

export const DescriptionText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
}));

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '1.6rem',
  marginBottom: '1.2rem',

  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,

  flexShrink: 0,
}));

export const HeaderTitle = styled('div')(({ theme }) => ({
  display: 'flex',
  color: theme.palette.color.base1300,

  maxWidth: '80%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

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

export const Body = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '0 1.6rem',
  boxSizing: 'border-box',

  overflow: 'auto',

  flex: 1,
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  width: '100%',
  flex: 1,
});

export const SectionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const LabelContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: '1rem',
});

export const ChainContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',
});

export const ChainImage = styled(BaseChainImage)({
  width: '1.6rem',
  height: '1.6rem',
});

export const ChainName = styled('div')(({ theme }) => ({
  display: 'flex',
  color: theme.palette.color.base1300,

  maxWidth: '100%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const ThumbnailImageContainer = styled(Image)({
  borderRadius: '0.4rem',
  position: 'relative',
  aspectRatio: '4 / 3',
  maxWidth: '70%',
  height: 'auto',
});

export const PinButton = styled('button')({
  width: '1.8rem',
  height: '1.8rem',
  padding: '0',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',

  '&:hover': {
    opacity: '0.8',
  },
});

type PinnedIconContainerProps = {
  'data-is-active': boolean;
};

export const PinnedIconContainer = styled('div')<PinnedIconContainerProps>(({ theme, ...props }) => ({
  width: '1.8rem',
  height: '1.8rem',
  '& > svg': {
    width: '1.8rem',
    height: '1.8rem',

    fill: props['data-is-active'] ? theme.palette.accentColor.yellow300 : 'null',

    '& > path': {
      fill: props['data-is-active'] ? theme.palette.accentColor.yellow300 : 'null',
    },
  },
}));

export const GridContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(7rem, 1fr))',
  rowGap: '1rem',
  columnGap: '3rem',
});

export const SocialButtonWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '1.6rem',
});

export const Footer = styled('div')({
  marginTop: 'auto',
  padding: '1.2rem',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '80%',
    maxHeight: '93%',
  },
});

export const FooterContentsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.4rem',

  '& * > svg': {
    width: '1.6rem',
    height: '1.6rem',
  },
});
