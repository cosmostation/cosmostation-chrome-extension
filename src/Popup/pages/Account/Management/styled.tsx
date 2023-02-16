import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  position: 'relative',
});

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  width: '100%',
  maxHeight: 'calc(100% - 12.4rem)',

  overflow: 'auto',
});

export const ButtonContainer = styled('div')({
  position: 'absolute',
  width: 'calc(100% - 3.2rem)',
  height: '8rem',

  bottom: '0',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const StyledButton = styled(Button)({});

export const SideButton = styled(IconButton)(({ theme }) => ({
  padding: '0',

  '& svg': {
    fill: theme.colors.base06,
    '& > path': {
      fill: theme.colors.base06,
    },
  },
}));
