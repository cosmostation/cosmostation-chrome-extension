import { useEffect, useRef, useState } from 'react';
import { Typography } from '@mui/material';

import IconButton from '@/components/common/IconButton';

import { ChipButtonContentsContainer, Container, ContentsContainer, IconContainer, LeftChevronIconContainer } from './styled';
import ChipTypeButton from '../ChipTypeButton';

import PopularIcon from '@/assets/images/icons/Popular16.svg';
import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

const CHIP_WIDTH = 100;

const DEFAULT_DAPP_TYPE = 'Popular';

type ScrollableChipsProps = {
  types: string[];
  selectedType: string;
  onClick: (type: string) => void;
};

export default function ScrollableChips({ types, selectedType, onClick }: ScrollableChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = CHIP_WIDTH * 3;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollButtons);
    checkScrollButtons();
    return () => {
      el.removeEventListener('scroll', checkScrollButtons);
    };
  }, [types]);

  return (
    <Container>
      <IconButton
        sx={{
          width: 'fit-content',
          height: 'fit-content',
          display: !canScrollLeft ? 'none' : 'null',
        }}
        disabled={!canScrollLeft}
        onClick={() => handleScroll('left')}
      >
        <LeftChevronIconContainer>
          <RightChevronIcon />
        </LeftChevronIconContainer>
      </IconButton>

      <ContentsContainer ref={scrollRef} style={{ scrollBehavior: 'smooth' }}>
        {types.map((label) => (
          <ChipTypeButton
            key={label}
            isActive={selectedType === label}
            onClick={() => {
              onClick(label);
            }}
          >
            <ChipButtonContentsContainer>
              {label === DEFAULT_DAPP_TYPE && (
                <IconContainer>
                  <PopularIcon />
                </IconContainer>
              )}
              <Typography variant="h4_B">{label}</Typography>
            </ChipButtonContentsContainer>
          </ChipTypeButton>
        ))}
      </ContentsContainer>

      <IconButton
        sx={{
          width: 'fit-content',
          height: 'fit-content',
          display: !canScrollRight ? 'none' : 'null',
        }}
        onClick={() => handleScroll('right')}
      >
        <RightChevronIcon />
      </IconButton>
    </Container>
  );
}
