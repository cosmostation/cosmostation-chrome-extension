import { styled } from '@mui/material/styles';

import AbsoluteLoading from '~/Popup/components/AbsoluteLoading';
import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.base02,

  width: '100%',

  borderRadius: '0.8rem',

  padding: '1.6rem',

  position: 'relative',
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

  position: 'relative',
  width: '3.8rem',
  height: '3.8rem',
});

export const SecondLineLeftAbsoluteImageContainer = styled('div')({
  position: 'absolute',

  width: '3.8rem',
  height: '3.8rem',

  '& > img': {
    width: '3.8rem',
    height: '3.8rem',
  },
});

export const SecondLineLeftTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',

  justifyContent: 'center',
  alignItems: 'flex-start',

  marginLeft: '1rem',

  rowGap: '0.2rem',

  color: theme.colors.text01,
}));

export const SecondLineLeftSubTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  columnGap: '0.6rem',

  color: theme.colors.text02,
}));

export const SecondLineLeftSubTextEmptyContainer = styled('div')({
  height: '1.9rem',
});

export const SecondLineRightContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  justifyContent: 'center',
  alignItems: 'flex-end',

  rowGap: '0.3rem',
});

export const SecondLineRightTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const SecondLineRightSubTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

type TextChangeRateContainerProps = {
  'data-color'?: 'red' | 'green' | 'grey';
};

export const TextChangeRateContainer = styled('div')<TextChangeRateContainerProps>(({ theme, ...props }) => ({
  color: props['data-color'] === 'red' ? theme.accentColors.red : props['data-color'] === 'green' ? theme.accentColors.green01 : theme.colors.text02,
}));

export const FourthLineContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginTop: '1.6rem',
});

export const FourthLineCenterContainer = styled('div')({
  width: '0.8rem',
  flexShrink: 0,
});

export const StyledRetryIconButton = styled(IconButton)(({ theme }) => ({
  padding: '0',

  '& svg': {
    fill: theme.colors.base05,
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));

export const ErrorDescriptionContainer = styled('div')(({ theme }) => ({
  marginTop: '0.2rem',

  color: theme.accentColors.red,
}));

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.8rem',
});
