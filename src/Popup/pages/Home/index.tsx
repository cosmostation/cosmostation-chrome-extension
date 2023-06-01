import { useEffect } from 'react';

import { useChromeStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';

export default function HOME() {
  const { navigate } = useNavigate();
  const { chromeStorage } = useChromeStorage();
  const { rootPath } = chromeStorage;

  useEffect(() => {
    if (chromeStorage.accounts.length < 1) {
      navigate('/account/initialize/welcome', { replace: true });
    } else if (rootPath) {
      navigate(rootPath, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
