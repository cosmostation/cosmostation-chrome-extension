import { styled } from '@mui/material/styles';

import { Container as BaseContainer, LeftContainter as BaseLeftContainter } from '~/Popup/components/common/Dialog/Header/styled';

export const Container = BaseContainer;

export const LeftContainter = BaseLeftContainter;

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: '0 0.8rem',
  margin: 0,
  border: `0.1rem solid ${theme.colors.base04}`,
  borderRadius: '0.8rem',

  height: '3.2rem',

  color: theme.colors.text01,

  cursor: 'pointer',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '&:hover': {
    backgroundColor: theme.colors.base04,
  },

  '& > svg': {
    marginRight: '0.4rem',
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));
