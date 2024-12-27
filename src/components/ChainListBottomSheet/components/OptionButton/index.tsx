import { forwardRef } from 'react';

import { ActiveBadge, ChainImage, ChainNameText, LeftContainer, StyledChainButton } from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';

type OptionButtonProps = {
  image: string | null;
  name: string;
  id: string;
  isActive?: boolean;
  onSelectChain?: (id: string) => void;
};

const OptionButton = forwardRef<HTMLButtonElement, OptionButtonProps>(({ image, name, id, isActive, onSelectChain, ...remainder }, ref) => {
  return (
    <StyledChainButton
      onClick={() => {
        onSelectChain?.(String(id));
      }}
      {...remainder}
      ref={isActive ? ref : undefined}
    >
      <LeftContainer>
        <ChainImage src={image} />
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
