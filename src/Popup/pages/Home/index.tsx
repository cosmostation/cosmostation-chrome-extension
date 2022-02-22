import { useEffect } from 'react';

import { PATH } from '~/constants/route';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';

export default function HOME() {
  const { navigate } = useNavigate();
  const { chromeStorage } = useChromeStorage();
  const { rootPath } = chromeStorage;

  useEffect(() => {
    if (rootPath) {
      navigate(rootPath, { replace: true });
    } else {
      navigate(PATH.DASHBOARD, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
