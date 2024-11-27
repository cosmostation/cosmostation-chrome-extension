import { styled } from '@mui/material/styles';

import IconButton from '@/components/common/IconButton';

export const LeftNavigatorContainer = styled('div')({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  columnGap: '0.8rem',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  '& > svg > path': {
    fill: theme.palette.color.base1300,
  },
  // NOTE 아이콘 버튼 상태에 대한 색상 정리 필요.
  '&:disabled': {
    '& > svg > path': {
      fill: 'black',
    },
  },
}));
