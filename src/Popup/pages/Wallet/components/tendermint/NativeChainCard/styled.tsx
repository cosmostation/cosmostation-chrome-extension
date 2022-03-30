import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.base02,

  width: '100%',

  borderRadius: '0.8rem',

  padding: '1.6rem',
}));

export const FirstLineContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  height: '2.4rem',
});

export const FirstLineLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const FirstLineRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const StyledIconButton = styled(IconButton)({
  marginRight: '-0.8rem',
});

export const SecondLineContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginTop: '1.6rem',
});

export const SecondLineLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const SecondLineLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const SecondLineLeftTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: '0.8rem',

  color: theme.colors.text01,
}));

export const SecondLineRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const ThirdLineContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const FourthLineContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',

  marginTop: '0.6rem',

  rowGap: '0.4rem',
});

export const FourthLineContainerItem = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const FourthLineContainerItemLeft = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const FourthLineContainerItemRight = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const ButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginTop: '1.6rem',
});

export const ButtonCenterContainer = styled('div')({
  width: '0.8rem',
  flexShrink: 0,
});
