import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')<{ typo_varient: 'h4' | 'h5' }>(({ theme, typo_varient }) => ({
  border: 'none',

  width: typo_varient === 'h4' ? '32rem' : '14.2rem',
  height: typo_varient === 'h4' ? '4.8rem' : '3.6rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.accentColors.purple01,
  color: theme.accentColors.white,

  '&:hover': {
    backgroundColor: theme.accentColors.purple02,
  },

  '&:disabled': {
    backgroundColor: theme.colors.base04,
    color: theme.colors.text02,

    '& svg': {
      fill: theme.colors.text02,
    },
  },
}));

export const ContentContainer = styled('div')<{ is_image?: number }>(({ is_image }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: is_image ? '-1.2rem' : '0',

  '& :first-of-type': {
    marginRight: is_image ? '0.8rem' : '0',
  },
}));
