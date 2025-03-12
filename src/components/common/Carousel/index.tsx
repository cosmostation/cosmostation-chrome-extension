import type React from 'react';
import { Children } from 'react';

import { CarouselContainer, CarouselItem, CarouselItemContainer, Indicator, IndicatorContainer } from './styled';

type CarouselProps = {
  children: React.ReactNode;
  currentIndex: number;
  hideIndicator?: boolean;
  onClickNext?: () => void;
  onClickPrev?: () => void;
};

export default function Carousel({ children, currentIndex, hideIndicator, onClickNext, onClickPrev }: CarouselProps) {
  const handleIndicatorClick = (index: number) => {
    if (index > currentIndex) {
      onClickNext?.();
    } else if (index < currentIndex) {
      onClickPrev?.();
    }
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
      {hideIndicator
        ? null
        : Children.count(children) > 1 && (
            <IndicatorContainer>
              {Children.map(children, (_, index) => (
                <Indicator key={index} isActive={currentIndex === index} onClick={() => handleIndicatorClick(index)} />
              ))}
            </IndicatorContainer>
          )}
    </>
  );
}
