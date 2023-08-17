import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')({
  padding: '0 0 1.6rem 0',

  position: 'relative',

  height: '100%',
});

export const StyledIconButton = styled(IconButton)({
  marginRight: '-0.8rem',
});

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.accentColors.green01,
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',
  left: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});
