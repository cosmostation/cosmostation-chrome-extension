import { styled } from '@mui/material/styles';

type SideTextButtonProps = {
  'data-is-active': boolean;
};

export const SideTextButton = styled('button')<SideTextButtonProps>(({ theme, ...props }) => ({
  border: 0,

  display: 'flex',
  alignItems: 'center',

  background: 'none',

  cursor: 'pointer',

  padding: '0',

  '& svg': {
    fill: props['data-is-active'] ? theme.colors.base06 : theme.colors.base05,
    '& > path': {
      fill: props['data-is-active'] ? theme.colors.base06 : theme.colors.base05,
    },
  },

  '&:hover': {
    opacity: 0.7,
  },
}));

type ButtonTextContainerProps = {
  'data-is-active': boolean;
};

export const ButtonTextContainer = styled('div')<ButtonTextContainerProps>(({ theme, ...props }) => ({
  marginLeft: '0.2rem',

  color: props['data-is-active'] ? theme.colors.text01 : theme.colors.text02,
}));
