import { useSetRecoilState } from 'recoil';

import { loadingLedgerSigningState, loadingOverlayState } from '~/Popup/recoils/loading';

export function useLoading() {
  const setLoadingOverlay = useSetRecoilState(loadingOverlayState);
  const setLoadingLedgerSigning = useSetRecoilState(loadingLedgerSigningState);

  return { setLoadingOverlay, setLoadingLedgerSigning };
}
