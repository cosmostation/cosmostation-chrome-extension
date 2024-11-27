import { BodyText, LeftContainer, MiddleContainer, PlusIconContainer, RightContainer, StyledButton, TitleText } from './styled';

import PlusIcon from '@/assets/images/icons/Plus12.svg';
import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type OptionButtonProps = {
  titleText: string;
  bodyText: string;
};

export default function OptionButton({ titleText, bodyText }: OptionButtonProps) {
  return (
    <StyledButton>
      <LeftContainer>
        <PlusIconContainer>
          <PlusIcon />
        </PlusIconContainer>
      </LeftContainer>
      <MiddleContainer>
        <TitleText variant="b2_B">{titleText}</TitleText>
        <BodyText variant="b4_R">{bodyText}</BodyText>
      </MiddleContainer>
      <RightContainer>
        <RightChevronIcon />
      </RightContainer>
    </StyledButton>
  );
}
