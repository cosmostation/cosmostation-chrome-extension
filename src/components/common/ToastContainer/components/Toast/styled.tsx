import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import IconButton from '@/components/common/IconButton';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const TitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  marginRight: '0.2rem',
});

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  '& svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.commonColor.commonWhite,
    '& path': {
      fill: theme.palette.commonColor.commonWhite,
    },
  },
}));

export const TitleText = styled(Typography)(({ theme }) => ({
  color: theme.palette.commonColor.commonWhite,
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  '& svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.commonColor.commonWhite,
    '& path': {
      fill: theme.palette.commonColor.commonWhite,
    },
  },
}));
