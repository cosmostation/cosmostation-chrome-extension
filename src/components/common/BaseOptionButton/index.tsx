import { LeftContainer, MiddleContainer, RightContainer, StyledButton } from './styled';

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type BaseOptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  leftContent?: JSX.Element;
  leftSecondHeader?: JSX.Element;
  leftSecondBody?: JSX.Element;
  rightContent?: JSX.Element;
};

export default function BaseOptionButton({ leftContent, leftSecondHeader, leftSecondBody, rightContent, ...remainder }: BaseOptionButtonProps) {
  return (
    <StyledButton {...remainder}>
      <LeftContainer>{leftContent}</LeftContainer>
      <MiddleContainer>
        {leftSecondHeader}
        {leftSecondBody}
      </MiddleContainer>
      <RightContainer>
        {rightContent}
        <RightChevronIcon />
      </RightContainer>
    </StyledButton>
  );
}
