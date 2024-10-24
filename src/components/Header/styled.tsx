import { styled } from '@mui/material/styles';

import IconButton from '../IconButton';

export const Container = styled('div')(({ theme }) => ({
  height: '3rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '0 1rem',

  backgroundColor: theme.palette.color.base100,

  position: 'relative',
}));

export const LeftContentContainer = styled('div')({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  columnGap: '0.8rem',
});

export const MiddleContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const RightContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

export const StyledIconButton = styled(IconButton)({
  // NOTE 아이콘 버튼 상태에 대한 색상 정리 필요.
  // '&:disabled': {
  //   '& > svg > path': {
  //     fill: 'red',
  //   },
  // },
});
