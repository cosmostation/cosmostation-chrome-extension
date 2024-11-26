import { styled } from '@mui/material/styles';

type ContainerProps = {
  backgroundImage?: string;
};

export const Container = styled('div')<ContainerProps>(({ ...props }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',

  '&.portfoiloBackground': {
    background: `
  ${props['backgroundImage'] && `url(${props['backgroundImage']}) no-repeat center right/ 70% auto`} ,
     linear-gradient(105.36deg, #373C46 0%, #1B1F27 100%)`,
  },

  '&.linearBg': {
    background: `linear-gradient(105.36deg, #373C46 0%, #1B1F27 100%)`,
  },

  '&.circleGradient': {
    background: 'linear-gradient(105.36deg, #22252B 0%, #0B0F17 100%)',
  },
}));

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
