import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import BaseLayout from '~/Popup/components/BaseLayout';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useLoadingOverlay } from '~/Popup/hooks/useLoadingOverlay';
import { disposableLoadingState } from '~/Popup/recoils/loadingOverlay';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const [isAlready, setIsAlready] = useRecoilState(disposableLoadingState);
  const setLoadingOverlay = useLoadingOverlay();

  const { setChromeStorage } = useChromeStorage();

  useEffect(() => {
    if (!isAlready) {
      setIsAlready(true);
      setLoadingOverlay(true);

      setTimeout(() => {
        setLoadingOverlay(false);
      }, 1000);
    }

    void setChromeStorage('rootPath', '/dashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <BaseLayout useHeader={{}}>{children}</BaseLayout>;
}
