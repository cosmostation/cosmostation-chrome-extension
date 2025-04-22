import { styled } from '@mui/material/styles';

type ContainerProps = {
  backgroundImage?: string;
};

export const Container = styled('div')<ContainerProps>(({ ...props }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',

  position: 'relative',

  '&.portfoiloBackground': {
    background: `
  ${props['backgroundImage'] && `url(${props['backgroundImage']}) no-repeat center right/ 70% auto`} ,
     linear-gradient(105.36deg, #373C46 0%, #1B1F27 100%)`,
  },

  '&.linearBg': {
    background: `linear-gradient(105.36deg, #373C46 0%, #1B1F27 100%)`,
  },

  '&.circleGradient': {
    background: 'linear-gradient(108.77deg, #22252B 12.43%, #0B0F17 87.57%)',
  },
}));

type CoinBackgroundImageProps = {
  backgroundImage?: string;
};

export const CoinBackgroundImage = styled('div')<CoinBackgroundImageProps>(({ ...props }) => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  zIndex: '1',

  '&.basic': {
    '&::before': {
      width: '100%',
      height: '100%',
      content: '""',
      background: `url(${props['backgroundImage']}) no-repeat calc(100% + 1rem) calc(50% + 2rem)/ 55% auto`,
      position: 'absolute',

      top: '0',
      left: '0',
      opacity: '0.1',
      zIndex: '-1',
    },
  },

  '&.stake': {
    '&::before': {
      width: '100%',
      height: '100%',
      content: '""',
      background: `url(${props['backgroundImage']}) no-repeat calc(100%) calc(100% + 2rem)/ auto auto`,
      position: 'absolute',

      top: '0',
      left: '0',
      opacity: '0.06',
      zIndex: '-1',
    },
  },

  '&.coinDetail': {
    '&::before': {
      width: '100%',
      height: '100%',
      content: '""',
      background: `url(${props['backgroundImage']}) no-repeat calc(100%) calc(30%)/ 55% auto`,
      position: 'absolute',

      top: '0',
      left: '0',
      opacity: '0.1',
      zIndex: '-1',
    },
  },

  '&.coinOverView': {
    '&::before': {
      width: '100%',
      height: '100%',
      content: '""',
      background: `url(${props['backgroundImage']}) no-repeat calc(100%) calc(7.5%)/ 55% auto`,
      position: 'absolute',

      top: '0',
      left: '0',
      opacity: '0.1',
      zIndex: '-1',
    },
  },
}));

export const BlurEffectLayer = styled('div')({
  position: 'absolute',
  width: '16rem',
  height: '16rem',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -75%)',
  background: 'rgba(243, 243, 243, 0.18)',
  filter: 'blur(5rem)',
});

type ContentContainerProps = {
  'data-is-bottom'?: boolean;
};

export const ContentsContainer = styled('div')<ContentContainerProps>(({ ...props }) => ({
  margin: props['data-is-bottom'] ? '2rem 2rem 0' : '2rem',
}));

export const TopContainer = styled('div')({});

export const BodyContainer = styled('div')({});

export const BottomContainer = styled('div')({
  width: '100%',
});
