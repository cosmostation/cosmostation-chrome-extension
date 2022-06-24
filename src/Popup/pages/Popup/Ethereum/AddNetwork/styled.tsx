import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  position: 'relative',

  height: '100%',
});

export const ContentContainer = styled('div')({
  height: 'calc(100% - 16.8rem)',

  padding: '2rem 1.6rem 0',
});

export const QuestionContainer = styled('div')(({ theme }) => ({
  padding: '0 4rem',

  textAlign: 'center',

  color: theme.colors.text01,
}));

export const WarningContainer = styled('div')({
  marginTop: '2rem',

  padding: '1.2rem 1.6rem',
  display: 'flex',

  backgroundColor: 'rgba(205, 26, 26, 0.15)',
});

export const WarningIconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.accentColors.red,

    '& > path': {
      fill: theme.accentColors.red,
    },
  },
}));

export const WarningTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.colors.text01,
}));

export const InfoContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  marginTop: '1.2rem',
}));

export const Info2ColumnsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const Info2ColumnsLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const Info2ColumnsRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const InfoText1Container = styled('div')(({ theme }) => ({
  paddingLeft: '0.1rem',
  color: theme.colors.text01,
}));

export const InfoText2Container = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

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
