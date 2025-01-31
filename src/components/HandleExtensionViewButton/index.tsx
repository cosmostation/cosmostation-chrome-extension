import type { IconButtonProps } from '@mui/material';
import { useLocation } from '@tanstack/react-router';

import { setPopupAsDefaultView, setSidePanelWithDefaultView } from '@/utils/view/controlView';
import { isSidePanelView } from '@/utils/view/sidepanel';
import { isInTabView } from '@/utils/view/tab';

import { StyledIconButton } from './styled';

import PopupViewIcon from '@/assets/images/icons/Popup24.svg';
import SidePanelView from '@/assets/images/icons/SidePanel24.svg';

type HandleExtensionViewButtonProps = IconButtonProps;

export default function HandleExtensionViewButton(props: HandleExtensionViewButtonProps) {
  const { onClick: propsOnClick, ...remainder } = props;

  const { pathname } = useLocation();

  if (isInTabView()) {
    return null;
  }

  const icon = isSidePanelView() ? <PopupViewIcon /> : <SidePanelView />;

  const handleViewChange = () => {
    if (isSidePanelView()) {
      setPopupAsDefaultView();
    } else {
      setSidePanelWithDefaultView(pathname);
    }
  };

  const handleOnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (propsOnClick) {
      propsOnClick(event);
    }

    handleViewChange();
  };

  return (
    <StyledIconButton sx={{ width: '1.4rem', height: '1.4rem' }} onClick={handleOnClick} {...remainder}>
      {icon}
    </StyledIconButton>
  );
}
