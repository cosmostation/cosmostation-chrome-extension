import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import Tooltip from '~/Popup/components/common/Tooltip';
// FIXME % 중앙정렬을 위해 값을 주었지만 수정이 필요함
export const SlippageCustomInputText = styled('div')({
  height: '2.4rem',
});

export const Container = styled('div')({
  padding: '1.3rem 1.6rem 1.6rem',
});

export const StyledButton = styled(Button)({
  marginTop: '2.4rem',
  height: '4rem',
});

export const HeaderInfoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.533rem',
});
export const HeaderInfoIconContainer = styled('div')(({ theme }) => ({
  height: '1.6rem',
  '& > svg': {
    fill: theme.colors.base05,
    '&:hover': {
      fill: theme.colors.base06,
    },
  },
}));

export const StyledTooltip = styled(Tooltip)(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.colors.base02,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    marginTop: '0.7rem !important',

    backgroundColor: theme.colors.base02,

    padding: '0.7rem',
    textAlign: 'start',

    maxWidth: '17rem',
  },
}));

export const SlippageButtonContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.8rem',

  marginTop: '1.6rem',
});

type SlippageButtonProps = {
  'data-is-active'?: boolean;
};

export const SlippageButton = styled(Button)<SlippageButtonProps>(({ theme, ...props }) => ({
  height: '3.2rem',
  width: '6.6rem',

  backgroundColor: props['data-is-active'] ? theme.accentColors.purple01 : theme.colors.base03,
  color: props['data-is-active'] ? theme.colors.text01 : theme.colors.text02,

  '&:hover': {
    backgroundColor: theme.accentColors.purple01,
    color: theme.colors.text01,
  },
}));

export const SlippageButtonTextContainer = styled('div')({});

type SlippageCustomInputProps = {
  'data-is-active'?: boolean;
};

export const SlippageCustomInput = styled(Input)<SlippageCustomInputProps>(({ theme, ...props }) => ({
  '&.MuiOutlinedInput-root': {
    height: '3.2rem',
    width: '6.6rem',

    border: 'none',

    backgroundColor: props['data-is-active'] ? theme.accentColors.purple01 : theme.colors.base03,
    color: props['data-is-active'] ? theme.colors.text01 : theme.colors.text02,

    '& .MuiInputAdornment-root': {
      marginLeft: '0',
      marginRight: '0.8rem',
      color: theme.colors.text01,
    },

    '& .MuiOutlinedInput-input': {
      textAlign: props['data-is-active'] ? 'end' : 'center',

      padding: '0.8rem 0',

      fontFamily: theme.typography.h5n.fontFamily,
      fontStyle: theme.typography.h5n.fontStyle,
      fontSize: theme.typography.h5n.fontSize,
      lineHeight: theme.typography.h5n.lineHeight,
      letterSpacing: theme.typography.h5n.letterSpacing,
      '&::placeholder': {
        textAlign: 'center',
      },
    },

    '&.Mui-focused': {
      '.MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
  },
}));
