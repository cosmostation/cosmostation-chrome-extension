import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import Tooltip from '~/Popup/components/common/Tooltip';

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
  color: props['data-is-active'] ? theme.accentColors.white : theme.colors.text02,

  '&:hover': {
    backgroundColor: theme.accentColors.purple01,
    color: theme.accentColors.white,
  },
}));

export const SlippageButtonTextContainer = styled('div')({});

type SlippageCustomInputContainerProps = {
  'data-is-active'?: boolean;
};

export const SlippageCustomInputConatiner = styled('div')<SlippageCustomInputContainerProps>(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  height: '3.2rem',
  width: '6.6rem',

  border: 'none',
  borderRadius: '0.8rem',

  color: props['data-is-active'] ? theme.accentColors.white : theme.colors.text02,
  backgroundColor: props['data-is-active'] ? theme.accentColors.purple01 : theme.colors.base03,

  '&:hover': {
    border: '0.1rem solid #9C6CFF',
  },
}));

type SlippageCustomInputProps = {
  'data-width': number;
};

export const SlippageCustomInput = styled(Input)<SlippageCustomInputProps>(({ theme, ...props }) => ({
  '&.MuiOutlinedInput-root': {
    color: theme.accentColors.white,
    backgroundColor: 'transparent',
    width: props['data-width'] > 0 ? `${props['data-width']}rem` : '100%',

    '& .MuiOutlinedInput-input': {
      padding: '0',

      height: '1.92rem',
      textAlign: 'center',
      fontFamily: theme.typography.h5n.fontFamily,
      fontStyle: theme.typography.h5n.fontStyle,
      fontSize: theme.typography.h5n.fontSize,
      lineHeight: theme.typography.h5n.lineHeight,
      letterSpacing: theme.typography.h5n.letterSpacing,
      '&::placeholder': {
        opacity: 1,
      },
    },

    '.MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
}));

export const SlippageCustomInputAdornment = styled('div')({
  height: '1.8rem',
});
