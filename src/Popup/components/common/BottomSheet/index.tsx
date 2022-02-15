import type { DrawerProps } from '@mui/material';

import { StyledDrawer } from './styled';

export default function BottomSheet(props: DrawerProps) {
  return <StyledDrawer {...props} anchor="bottom" />;
}
