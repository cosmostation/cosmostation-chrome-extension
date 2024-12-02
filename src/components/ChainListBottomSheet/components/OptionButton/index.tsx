import { ActiveBadge, ChainImage, ChainNameText, LeftContainer, StyledChainButton } from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';

type OptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  image: string | null;
  name: string;
  id: string;
  isActive?: boolean;
  onSelectChain?: (id: string) => void;
};

export default function OptionButton({ image, name, id, isActive, onSelectChain, ...remainder }: OptionButtonProps) {
  return (
    <StyledChainButton
      onClick={() => {
        onSelectChain?.(String(id));
      }}
      {...remainder}
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
}
