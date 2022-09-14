import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  position: 'relative',
});

export const InputContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const BottomSettingButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginBottom: '2.4rem',
});

export const BottomGuideButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginBottom: '2.4rem',
});

export const BottomGuideButton = styled('button')(({ theme }) => ({
  padding: 0,
  border: 0,
  backgroundColor: 'transparent',

  borderBottom: `0.1rem solid ${theme.accentColors.purple01}`,

  color: theme.accentColors.purple01,
}));

export const StyledInput48 = styled(Input)({
  height: '4.8rem',
});
