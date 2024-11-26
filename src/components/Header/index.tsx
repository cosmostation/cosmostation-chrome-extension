import { useLocation, useNavigate } from '@tanstack/react-router';

import { Container, LeftContentContainer, MiddleContentContainer, RightContentContainer, StyledIconButton } from './styled';

import HomeIcon from '@/assets/images/icons/Home14.svg';
import ArrowBackIcon from '@/assets/images/icons/LeftArrow14.svg';

type HeaderProps = {
  middleContent?: JSX.Element;
  rightContent?: JSX.Element;
};

// NOTE 하위 컴포넌트 폴더에 미들, 라이트 컨텐츠에 들어갈 수 있는 컴포넌트 사전정의 떄려버리기.
export default function Header({ middleContent, rightContent }: HeaderProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isDisableBackButton = pathname === '/';

  return (
    <Container>
      <LeftContentContainer>
        <StyledIconButton
          disabled={isDisableBackButton}
          onClick={() => {
            navigate({
              to: '/',
            });
          }}
        >
          <ArrowBackIcon />
        </StyledIconButton>
        <StyledIconButton
          disabled={isDisableBackButton}
          onClick={() => {
            navigate({
              to: '/',
            });
          }}
        >
          <HomeIcon />
        </StyledIconButton>
      </LeftContentContainer>
      <MiddleContentContainer>{middleContent && middleContent}</MiddleContentContainer>
      <RightContentContainer>{rightContent && rightContent}</RightContentContainer>
    </Container>
  );
}
