import { styled } from '@mui/material/styles';

export const CarouselContainer = styled('div')({
  width: '100%',
  position: 'relative',
});

type CarouselItemProps = {
  isActive?: boolean;
};

export const CarouselItem = styled('div')<CarouselItemProps>(({ isActive }) => ({
  width: '100%',
  height: '100%',
  position: isActive ? 'relative' : 'absolute',
  top: 0,
  left: 0,
}));

export const IndicatorContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '0.5rem',
});

type IndicatorProps = {
  isActive?: boolean;
};

export const Indicator = styled('button')<IndicatorProps>(({ theme, ...props }) => ({
  width: props['isActive'] ? '1.3rem' : '0.6rem',
  height: '0.6rem',

  borderRadius: props['isActive'] ? '10rem' : '50%',
  padding: 0,

  cursor: 'pointer',

  background: theme.palette.color.base1200,
  opacity: props['isActive'] ? '1' : '0.2',

  margin: '0 0.2rem',
  border: 'none',
  transition: 'width 0.3s ease-out, border-radius 0.3s ease-out, opacity 0.3s ease-out',
  '&:hover': {
    opacity: '1',
  },
}));
