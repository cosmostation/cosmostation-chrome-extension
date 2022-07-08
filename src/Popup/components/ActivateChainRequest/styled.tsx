import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

export const Container = styled('div')({
  padding: '0.8rem 0 1.6rem 0',

  position: 'relative',

  height: '100%',
});

export const ContentsContainer = styled('div')({
  padding: '6rem 1.6rem 0 1.6rem',
});

export const LogoContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',

  '& > img': {
    width: '8rem',
    height: '8rem',
  },
});

export const TitleContainer = styled('div')(({ theme }) => ({
  marginTop: '2rem',
  color: theme.colors.text01,

  textAlign: 'center',
}));

export const ChainImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > img': {
    width: '4rem',
    height: '4rem',
  },
});

export const DescriptionContainer = styled('div')(({ theme }) => ({
  marginTop: '1.2rem',
  color: theme.colors.text01,

  textAlign: 'center',
}));

export const StyledDivider = styled(Divider)({
  margin: '2.8rem 0',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
  left: '1.6rem',
});

export const AccentSpan = styled('span')(({ theme }) => ({
  color: theme.accentColors.purple01,
}));
