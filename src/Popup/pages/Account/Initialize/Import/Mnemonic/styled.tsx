import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '2.8rem 2.4rem 0',

  position: 'relative',
});

export const InputContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 4.8rem)',

  bottom: '2.4rem',
});

export const BottomSettingButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginBottom: '2.4rem',
});

export const StyledInput48 = styled(Input)({
  height: '4.8rem',
});

export const StyledInput140 = styled(Input)({
  minHeight: '14rem',
});
