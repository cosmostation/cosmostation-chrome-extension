import type { DrawerProps } from '@mui/material/Drawer';

import { StyledDrawer } from './styled';

export default function BottomSheet(props: DrawerProps) {
  return <StyledDrawer {...props} anchor="bottom" disableRestoreFocus={true} closeAfterTransition={true} />;
}
