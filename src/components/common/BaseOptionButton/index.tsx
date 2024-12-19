import { LeftContainer, MiddleContainer, RightContainer, StyledButton } from './styled';

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type BaseOptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  leftContent?: JSX.Element;
  leftSecondHeader?: JSX.Element;
  leftSecondBody?: JSX.Element;
  rightContent?: JSX.Element;
  isActive?: boolean;
  disableRightChevron?: boolean;
};

export default function BaseOptionButton({
  leftContent,
  leftSecondHeader,
  leftSecondBody,
  rightContent,
  isActive = false,
  disableRightChevron = false,
  ...remainder
}: BaseOptionButtonProps) {
  return (
    <StyledButton isActive={isActive} {...remainder}>
      {leftContent && <LeftContainer>{leftContent}</LeftContainer>}
      <MiddleContainer>
        {leftSecondHeader}
        {leftSecondBody}
      </MiddleContainer>
      <RightContainer>
        {rightContent}
        {disableRightChevron ? null : <RightChevronIcon />}
      </RightContainer>
    </StyledButton>
  );
}
