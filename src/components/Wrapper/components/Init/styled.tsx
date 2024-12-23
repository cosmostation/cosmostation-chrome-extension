import { styled } from '@mui/material/styles';

import backgroungImg from '@/assets/images/backgroundImage/background.png';

export const Splash = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '1.2rem',

  boxSizing: 'border-box',

  backgroundImage: `url(${backgroungImg})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundColor: theme.palette.common.black,
  position: 'relative',
}));
