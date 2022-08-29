import { useRecoilValue } from 'recoil';

import { loadingOverlayState } from '~/Popup/recoils/loading';

import { Container, StyledCircularProgress } from './styled';

export default function Overlay() {
  const isShow = useRecoilValue(loadingOverlayState);

  if (!isShow) {
    return null;
  }

  return (
    <Container>
      <StyledCircularProgress />
    </Container>
  );
}
