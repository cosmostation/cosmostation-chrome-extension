import { BodyText, IconContainer, LeftContainer, MiddleContainer, RightContainer, StyledButton, TitleText } from './styled';

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type OptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  icon: JSX.Element;
  titleText: string;
  bodyText: string;
};

export default function OptionButton({ icon, titleText, bodyText, ...remainder }: OptionButtonProps) {
  return (
    <StyledButton {...remainder}>
      <LeftContainer>
        <IconContainer>{icon}</IconContainer>
      </LeftContainer>
      <MiddleContainer>
        <TitleText variant="b2_B">{titleText}</TitleText>
        <BodyText variant="b4_R_Multiline">{bodyText}</BodyText>
      </MiddleContainer>
      <RightContainer>
        <RightChevronIcon />
      </RightContainer>
    </StyledButton>
  );
}
