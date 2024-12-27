import { forwardRef } from 'react';

import type { UniqueChainId } from '@/types/chain';

import { ActiveBadge, ChainImage, ChainNameText, LeftContainer, StyledChainButton } from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';

import DefaultChain from '@/assets/images/chain/defaultChain.png';

type OptionButtonProps = {
  image: string | null;
  name: string;
  id?: UniqueChainId;
  isActive?: boolean;
  onSelectChain?: (id?: UniqueChainId) => void;
};

const OptionButton = forwardRef<HTMLButtonElement, OptionButtonProps>(({ image, name, isActive, id, onSelectChain, ...remainder }, ref) => {
  return (
    <StyledChainButton
      onClick={() => {
        onSelectChain?.(id);
      }}
      {...remainder}
      ref={isActive ? ref : undefined}
    >
      <LeftContainer>
        <ChainImage src={image} defaultImgSrc={DefaultChain} />
        <ChainNameText variant="b2_M">{name}</ChainNameText>
      </LeftContainer>
      {isActive && (
        <ActiveBadge>
          <CheckIcon />
        </ActiveBadge>
      )}
    </StyledChainButton>
  );
});

OptionButton.displayName = 'OptionButton';

export default OptionButton;
