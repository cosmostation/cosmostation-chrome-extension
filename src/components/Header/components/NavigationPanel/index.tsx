import { useLocation, useNavigate, useRouter } from '@tanstack/react-router';

import { Route as Home } from '@/pages/index';

import { LeftNavigatorContainer, StyledIconButton } from './styled';

import HomeIcon from '@/assets/images/icons/Home16.svg';
import ArrowBackIcon from '@/assets/images/icons/LeftArrow16.svg';

type NavigationPanelProps = {
  isHideBackButton?: boolean;
  isHideHomeButton?: boolean;
};

export default function NavigationPanel({ isHideBackButton, isHideHomeButton }: NavigationPanelProps) {
  const navigate = useNavigate();
  const { history } = useRouter();
  const { pathname } = useLocation();

  const isDisableBackButton = history.length <= 1 || pathname === '/';
  const isDisableHomeButton = pathname === '/';

  return (
    <LeftNavigatorContainer>
      {!isHideBackButton && (
        <StyledIconButton
          disabled={isDisableBackButton}
          onClick={() => {
            history.back();
          }}
        >
          <ArrowBackIcon />
        </StyledIconButton>
      )}
      {!isHideHomeButton && (
        <StyledIconButton
          disabled={isDisableHomeButton}
          onClick={() => {
            navigate({
              to: Home.to,
            });
          }}
        >
          <HomeIcon />
        </StyledIconButton>
      )}
    </LeftNavigatorContainer>
  );
}
