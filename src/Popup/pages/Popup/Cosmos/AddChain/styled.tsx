import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

export const Container = styled('div')({
  padding: '0.8rem 0 1.6rem 0',

  position: 'relative',

  height: '100%',
});

export const ContentsContainer = styled('div')({
  padding: '0 1.6rem 0 1.6rem',
});

export const LogoContainer = styled('div')({
  marginTop: '6.8rem',

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
  marginTop: '1.2rem',
  color: theme.colors.text01,

  textAlign: 'center',
}));

export const StyledDivider = styled(Divider)({
  margin: '2.8rem 0',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',
  left: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const BottomButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
});

export const WarningContainer = styled('div')({
  padding: '1.2rem 2.2rem 1.2rem 1.6rem',

  borderRadius: '0.8rem',

  backgroundColor: 'rgba(205, 26, 26, 0.15)',

  display: 'flex',

  marginBottom: '1.6rem',
});

export const WarningIconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    '& > path': {
      fill: theme.accentColors.red,
    },
  },
}));

export const WarningTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.colors.text01,
}));

export const AccentSpan = styled('span')(({ theme }) => ({
  color: theme.accentColors.purple01,
}));
