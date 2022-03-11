import { useRecoilValue } from 'recoil';

import { loadingOverlayState } from '~/Popup/recoils/loadingOverlay';

import { Container, StyledCircularProgress } from './styled';

export default function Overlay() {
  const isShow = useRecoilValue(loadingOverlayState);
  return isShow ? (
    <Container>
      <StyledCircularProgress />
    </Container>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <></>
  );
}
