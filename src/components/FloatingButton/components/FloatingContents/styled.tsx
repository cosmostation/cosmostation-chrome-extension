import { keyframes, styled } from '@mui/material/styles';

export const FloatingContentsConainer = styled('div')({
  width: '5.4rem',
  height: '5.4rem',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const rotateGradient = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

type RotatingBorderProps = {
  'start-color': string;
  'end-color': string;
};

export const RotatingBorder = styled('div')<RotatingBorderProps>((props) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',

  borderRadius: '50%',

  background: `conic-gradient(
    from 0deg,
    ${props['start-color']} 0%,
    ${props['end-color']} 50%,
    ${props['start-color']} 100%
  )`,

  animation: `${rotateGradient} 2.4s linear infinite`,
}));

export const InnerCircle = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: 'calc(100% - 0.4rem)',
  height: 'calc(100% - 0.4rem)',
  borderRadius: '50%',
  backgroundColor: theme.palette.color.base100,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1,
}));

export const CenteredImageContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '80%',
  height: '80%',
  borderRadius: '50%',
  backgroundColor: theme.palette.color.base100,
  zIndex: 2,

  '& > img': {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  },
}));
