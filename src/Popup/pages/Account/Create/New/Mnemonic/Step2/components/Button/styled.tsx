import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  'data-is-active'?: number;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  padding: '0 0.9rem',
  margin: 0,
  border: 0,
  backgroundColor: props['data-is-active'] ? theme.accentColors.purple01 : 'transparent',
  color: props['data-is-active'] ? theme.accentColors.white : theme.colors.text02,

  borderRadius: '5rem',

  height: '2.4rem',
  width: 'max-content',

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: props['data-is-active'] ? theme.accentColors.purple01 : theme.colors.base02,
    color: props['data-is-active'] ? theme.accentColors.white : theme.colors.text01,
  },
}));
