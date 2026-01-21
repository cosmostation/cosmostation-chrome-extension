import { Children, type ReactNode, useEffect, useRef, useState } from 'react';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';

import { CarouselContainer, CarouselItem, Indicator, IndicatorContainer } from './styled';

type CarouselProps = {
  children: ReactNode;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  showIndicator?: boolean;
};

export default function Carousel({ children, currentIndex, onIndexChange, showIndicator = true }: CarouselProps) {
  const childArray = Children.toArray(children);
  const childCount = childArray.length;
  const isIndicatorVisible = showIndicator && childCount > 1;

  const prevIndexRef = useRef(currentIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleExited = () => {
    prevIndexRef.current = currentIndex;
    setIsTransitioning(false);
  };

  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      setIsTransitioning(true);
    }
  }, [currentIndex]);

  return (
    <>
      <CarouselContainer>
        {childArray.map((child, index) => {
          const isActive = index === currentIndex;
          const isPrev = index === prevIndexRef.current && isTransitioning;
          const shouldRender = isActive || isPrev;

          if (!shouldRender) return null;

          return (
            <Fade key={index} in={isActive} timeout={400} onExited={isActive ? undefined : handleExited}>
              <CarouselItem isActive={isActive}>{child}</CarouselItem>
            </Fade>
          );
        })}
      </CarouselContainer>

      <Collapse in={isIndicatorVisible} timeout={300}>
        <IndicatorContainer>
          {Array.from({ length: childCount }, (_, index) => (
            <Indicator
              key={index}
              isActive={currentIndex === index}
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange(index);
              }}
            />
          ))}
        </IndicatorContainer>
      </Collapse>
    </>
  );
}
