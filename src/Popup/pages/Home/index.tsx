import { useEffect } from 'react';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';

export default function HOME() {
  const { navigate } = useNavigate();
  const { extensionStorage } = useExtensionStorage();
  const { rootPath } = extensionStorage;

  useEffect(() => {
    if (extensionStorage.accounts.length < 1) {
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
