import { useLocation, useNavigate } from '@tanstack/react-router';

import { LeftNavigatorContainer, StyledIconButton } from './styled';

import HomeIcon from '@/assets/images/icons/Home14.svg';
import ArrowBackIcon from '@/assets/images/icons/LeftArrow14.svg';

type NavigatorProps = {
  isHideBackButton?: boolean;
  isHideHomeButton?: boolean;
};

export default function Navigator({ isHideBackButton, isHideHomeButton }: NavigatorProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isDisableBackButton = pathname === '/';

  return (
    <LeftNavigatorContainer>
      {!isHideBackButton && (
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
      )}
      {!isHideHomeButton && (
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
      )}
    </LeftNavigatorContainer>
  );
}
