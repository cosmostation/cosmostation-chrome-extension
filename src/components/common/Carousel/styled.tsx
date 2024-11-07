import { styled } from '@mui/material/styles';

export const CarouselContainer = styled('div')({
  width: '100%',
  display: 'flex',
  position: 'relative',
});

type CarouselItemContainerProps = {
  currentIndex: number;
};

export const CarouselItemContainer = styled('div')<CarouselItemContainerProps>((props) => ({
  display: 'flex',
  width: '100%',
  transform: `translateX(-${props['currentIndex'] * 100}%)`,
  transition: 'transform 0.5s ease-in-out',
}));

export const CarouselItem = styled('div')({
  width: '100%',
  minWidth: '100%',
  height: '100%',
  transition: 'transform 0.5s ease-in-out',
});

export const IndicatorContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '0.5rem',
});

type IndicatorProps = {
  isActive?: boolean;
};

export const Indicator = styled('button')<IndicatorProps>(({ theme, ...props }) => ({
  width: '1rem',
  height: '1rem',

  borderRadius: '50%',
  padding: 0,

  cursor: 'pointer',

  background: props['isActive'] ? theme.palette.color.base1200 : theme.palette.color.base100,
  margin: '0 0.25rem',
  border: 'none',
  '&:hover': {
    background: theme.palette.color.base1200,
  },
}));
