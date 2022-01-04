import { useSetRecoilState } from 'recoil';

import { loadingOverlayState } from '~/Popup/recoils/loadingOverlay';

export function useLoadingOverlay() {
  const setLoadingOverlay = useSetRecoilState(loadingOverlayState);

  return setLoadingOverlay;
}
