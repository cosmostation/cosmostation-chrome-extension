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
  width: '100%',
  height: '100%',

  borderRadius: '50%',

  background: `linear-gradient(180deg,  ${props['start-color']}  0%, ${props['end-color']} 100%)`,
  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude',
  animation: `${rotateGradient} 2.4s linear infinite`,
  padding: '0.2rem',
  boxSizing: 'border-box',
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
  '& > img': {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  },
}));
