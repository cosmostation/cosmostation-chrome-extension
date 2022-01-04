import { useRecoilValue } from 'recoil';

import { loadingOverlayState } from '~/Popup/recoils/loadingOverlay';

import { Container } from './styled';

export default function Overlay() {
  const isShow = useRecoilValue(loadingOverlayState);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return isShow ? <Container /> : <></>;
}
