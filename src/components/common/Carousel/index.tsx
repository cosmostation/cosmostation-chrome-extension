import type React from 'react';
import { Children, useState } from 'react';

import { CarouselContainer, CarouselItem, CarouselItemContainer, Indicator, IndicatorContainer } from './styled';

type CarouselProps = {
  children: React.ReactNode;
};

export default function Carousel({ children }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <CarouselContainer>
        <CarouselItemContainer currentIndex={currentIndex}>
          {Children.map(children, (child, index) => (
            <CarouselItem key={index}>{child}</CarouselItem>
          ))}
        </CarouselItemContainer>
      </CarouselContainer>
      {Children.count(children) > 1 && (
        <IndicatorContainer>
          {Children.map(children, (_, index) => (
            <Indicator key={index} isActive={currentIndex === index} onClick={() => handleIndicatorClick(index)} />
          ))}
        </IndicatorContainer>
      )}
    </>
  );
}
