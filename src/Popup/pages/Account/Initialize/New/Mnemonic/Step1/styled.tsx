import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 2.4rem 0',

  position: 'relative',
});

export const StyledInput = styled(Input)({
  height: '4.8rem',

  marginTop: '1.2rem',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 4.8rem)',

  bottom: '2.4rem',
});
