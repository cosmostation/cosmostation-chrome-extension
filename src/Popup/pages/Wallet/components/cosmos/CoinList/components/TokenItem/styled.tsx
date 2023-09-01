import { styled } from '@mui/material/styles';

import AbsoluteLoading from '~/Popup/components/AbsoluteLoading';
import IconButton from '~/Popup/components/common/IconButton';

type StyledButtonProps = {
  'data-is-disabled'?: boolean;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  position: 'relative',

  backgroundColor: theme.colors.base02,
  border: 0,

  padding: '1.2rem',

  borderRadius: '0.8rem',

  cursor: 'pointer',

  '&:disabled': {
    cursor: 'default',

    '&:hover': {
      backgroundColor: theme.colors.base02,
    },
  },

  '&:hover': {
    backgroundColor: props['data-is-disabled'] ? theme.colors.base02 : theme.colors.base03,
    cursor: props['data-is-disabled'] ? 'default' : 'pointer',

    '#deleteButton': {
      display: 'block',
    },
  },
}));

export const Container = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

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
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const LeftTextContainer = styled('div')({
  paddingLeft: '0.8rem',

  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.3rem',
});

export const LeftTextChainContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
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

export const RightTextChangeRateContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const DeleteButton = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  marginRight: '-1rem',
  display: 'none',

  cursor: 'pointer',

  '& > svg': {
    fill: theme.colors.base05,

    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));

export const StyledAbsoluteLoading = styled(AbsoluteLoading)({
  borderRadius: '0.8rem',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  '& svg': {
    fill: theme.colors.base05,
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));
