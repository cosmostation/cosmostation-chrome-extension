import { styled } from '@mui/material/styles';

import IconButton from '../common/IconButton';

export const ContentsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  columnGap: '1rem',
  padding: '1rem 0 ',
});

export const ContentsInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.4rem',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: '3.1rem',
  height: '3.1rem',
  borderRadius: '50%',
  border: `0.13rem solid ${theme.palette.color.base200}`,
  '&:hover': {
    '& svg': {
      '& path': {
        stroke: theme.palette.accentColor.red100,
      },
    },
  },
}));
