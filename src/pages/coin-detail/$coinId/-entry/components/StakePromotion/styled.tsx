import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import { theme } from '@/styles/theme';

import stakePromotionImage from '@/assets/images/stakePromotion.png';

export const StyledButton = styled('button')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  border: 'none',
  padding: '1.6rem',

  rowGap: '0.6rem',

  '&:hover': {
    opacity: '0.8',
  },

  cursor: 'pointer',

  background: `url(${stakePromotionImage}) no-repeat right bottom/ 11.2rem auto, ${theme.palette.commonColor.commonBlack}}`,
});

export const TitleTextContainer = styled('div')({
  width: '75%',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'left',
});

export const TitleText = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const SubTitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  columnGap: '0.2rem',
});

export const SubTitleText = styled(Typography)(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
}));

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.4rem',
  height: '1.4rem',

  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.accentColor.purple400,

    '& > path': {
      fill: theme.palette.accentColor.purple400,
    },
  },
}));
