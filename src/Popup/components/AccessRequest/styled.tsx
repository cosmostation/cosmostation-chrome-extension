import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

export const Container = styled('div')({
  paddingBottom: '1.6rem',

  position: 'relative',

  height: '100%',
});

export const ContentsContainer = styled('div')({
  padding: '3rem 1.6rem 0 1.6rem',
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

export const DescriptionContainer = styled('div')(({ theme }) => ({
  wordBreak: 'break-all',

  marginTop: '1.2rem',
  color: theme.colors.text01,

  textAlign: 'center',
}));

export const AccentNameContainer = styled('span')(({ theme }) => ({
  color: theme.accentColors.purple01,
}));

export const StyledDivider = styled(Divider)({
  margin: '2.8rem 0',
});

export const Description2Container = styled('div')(({ theme }) => ({
  padding: '0 1.2rem',
  color: theme.colors.text02,

  textAlign: 'left',
}));

export const CheckListContainer = styled('div')({
  padding: '0 1.2rem',

  marginTop: '1.7rem',
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '1.5rem',
});

export const CheckItemContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const CheckContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& > svg > path': {
    fill: theme.accentColors.purple01,
  },
}));

export const TextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  marginLeft: '0.8rem',
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',

  width: 'calc(100% - 3.2rem)',
  left: '1.6rem',
  bottom: '1.6rem',
});
