import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  'data-typo-varient': 'h4' | 'h5';
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  border: 'none',

  width: '100%',
  height: props['data-typo-varient'] === 'h4' ? '4.8rem' : '3.2rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.accentColors.purple01,
  color: theme.accentColors.white,

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.accentColors.purple02,
  },

  '&:disabled': {
    backgroundColor: theme.colors.base04,
    color: theme.colors.text02,

    cursor: 'default',

    '& svg': {
      fill: theme.colors.text02,

      '& > path': {
        fill: theme.colors.text02,
      },
    },
  },
}));

type ContentContainerProps = {
  'data-is-icon'?: number;
};

export const ContentContainer = styled('div')<ContentContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: props['data-is-icon'] ? '-0.6rem' : '0',

  '& :first-of-type': {
    marginRight: props['data-is-icon'] ? '0.4rem' : '0',
  },
}));
