import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import BaseLayout from '~/Popup/components/BaseLayout';
import { useLoadingOverlay } from '~/Popup/hooks/useLoadingOverlay';
import { disposableLoadingState } from '~/Popup/recoils/loadingOverlay';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const [isAlready, setIsAlready] = useRecoilState(disposableLoadingState);
  const setLoadingOverlay = useLoadingOverlay();

  useEffect(() => {
    if (!isAlready) {
      setIsAlready(true);
      setLoadingOverlay(true);

      setTimeout(() => {
        setLoadingOverlay(false);
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <BaseLayout useHeader={{}}>{children}</BaseLayout>;
}
