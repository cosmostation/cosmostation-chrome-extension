import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import BaseLayout from '~/Popup/components/BaseLayout';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useLoading } from '~/Popup/hooks/useLoading';
import { disposableLoadingState } from '~/Popup/recoils/loading';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const [isAlready, setIsAlready] = useRecoilState(disposableLoadingState);
  const { setLoadingOverlay } = useLoading();

  const { setExtensionStorage } = useExtensionStorage();

  useEffect(() => {
    if (!isAlready) {
      setIsAlready(true);
      setLoadingOverlay(true);

      setTimeout(() => {
        setLoadingOverlay(false);
      }, 1000);
    }

    void setExtensionStorage('rootPath', '/dashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <BaseLayout useHeader={{}}>{children}</BaseLayout>;
}
