import { styled } from '@mui/material/styles';

import AbsoluteLoading from '~/Popup/components/AbsoluteLoading';
import IconButton from '~/Popup/components/common/IconButton';

export const ButtonContainer = styled('div')({
  position: 'relative',
});

export const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',
  minHeight: '5.8rem',

  backgroundColor: theme.colors.base02,
  border: `0.1rem solid ${theme.colors.base02}`,

  padding: '1rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  borderRadius: '0.8rem',

  cursor: 'pointer',

  '&:hover': {
    border: `0.1rem solid ${theme.colors.base04}`,
  },

  '&:disabled:hover': {
    cursor: 'default',
    border: `0.1rem solid ${theme.colors.base02}`,
  },
}));

export const RightButtonContainer = styled('div')({
  position: 'absolute',

  right: '0.6rem',
  top: 0,
  bottom: 0,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  '& svg': {
    fill: theme.colors.base05,
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));

export const LeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  textAlign: 'left',
});

export const LeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > img': {
    width: '3.8rem',
    height: '3.8rem',
  },
});

export const LeftTextContainer = styled('div')({
  paddingLeft: '0.6rem',

  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.3rem',
});

export const LeftTextChainContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const LeftTextChainAmountContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const LeftTextErrorContainer = styled('div')(({ theme }) => ({
  color: theme.accentColors.red,
}));

export const RightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  textAlign: 'right',
});

export const RightTextContainer = styled('div')({
  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.3rem',
});

export const RightTextValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

type RightTextChangeRateContainerProps = {
  'data-color'?: 'red' | 'green' | 'grey';
};

export const RightTextChangeRateContainer = styled('div')<RightTextChangeRateContainerProps>(({ theme, ...props }) => ({
  color: props['data-color'] === 'red' ? theme.accentColors.red : props['data-color'] === 'green' ? theme.accentColors.green01 : theme.colors.text02,
}));

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.8rem',
});

export const LedgerCheckConnectContainer = styled('div')(({ theme }) => ({
  padding: '0.35rem 0.8rem 0.35rem 0.6rem',
  border: `0.1rem solid ${theme.colors.base04}`,
  borderRadius: '5rem',

  display: 'flex',
  alignItems: 'center',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));

export const LedgerCheckConnectTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.2rem',

  color: theme.colors.text01,
}));

export const LedgerCheckNotSupportedTextContainer = styled('div')(({ theme }) => ({
  padding: '0.35rem 0.8rem',
  color: theme.colors.text02,
}));
