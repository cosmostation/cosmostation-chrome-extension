import { styled } from '@mui/material/styles';

import backgroundImg from '@/assets/images/backgroundImage/background.png';

export const Splash = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '1.2rem',
  boxSizing: 'border-box',

  backgroundImage: `url(${backgroundImg})`,
  backgroundSize: 'auto',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundColor: '#101011',

  overflow: 'hidden',
  position: 'relative',
});
