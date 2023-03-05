import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  'data-typo-varient': 'h4' | 'h5';
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  border: `0.1rem solid ${theme.accentColors.purple01}`,

  width: '100%',
  height: props['data-typo-varient'] === 'h4' ? '4.8rem' : '3.2rem',

  borderRadius: '0.8rem',

  backgroundColor: 'transparent',
  color: theme.colors.text01,

  cursor: 'pointer',

  '&:hover': {
    borderColor: theme.accentColors.purple02,
  },

  '&:disabled': {
    border: 0,

    backgroundColor: theme.colors.base03,
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
