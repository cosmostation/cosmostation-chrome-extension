import { styled } from '@mui/material/styles';

import OutlinedInput from '@/components/common/OutlinedInput';

export const Body = styled('div')({});

export const StickyContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
  padding: '0.8rem 0 1.2rem',
  borderBottom: `0.06rem solid ${theme.palette.color.base100}`,
}));

export const StyledInput = styled(OutlinedInput)({
  height: '3.2rem',
});

export const PrivateAccordionContainer = styled('div')(({ theme }) => ({
  '&:last-child': {
    borderBottom: `0.06rem solid ${theme.palette.color.base100}`,
  },
}));
