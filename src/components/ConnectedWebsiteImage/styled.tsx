import { keyframes, styled } from '@mui/material/styles';

const dropShadowAnimation = keyframes`
  0% {
    filter: drop-shadow( 0 0 0.3rem  #3BCE98);
  }
  50% {
    filter: drop-shadow(0 0 0.3rem transparent);
  }
  100% {
    filter: drop-shadow(0 0 0.3rem  #3BCE98);
    }
`;

export const WebsiteImageWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '4rem',
  height: '4rem',
  borderRadius: '50%',
  backgroundColor: '#181A1F',
  border: `0.22rem solid ${theme.palette.accentColor.green500}`,

  animation: `${dropShadowAnimation} 2.4s infinite ease-in-out`,
}));

export const WebsiteImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '80%',
  height: '80%',
  borderRadius: '50%',
  '& > img': {
    width: '80%',
    height: '80%',
    borderRadius: '50%',
  },
});
