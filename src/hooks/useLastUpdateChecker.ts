import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUpdateBalance } from './update/useUpdateBalance';

export function useLastUpdateChecker(lastUpdate?: number | null) {
  const [status, setStatus] = useState<string>('');

  const { t } = useTranslation();
  const { isLoading: isUpdateBalanceLoading } = useUpdateBalance();

  useEffect(() => {
    if (!lastUpdate || isUpdateBalanceLoading) {
      setStatus('');
      return;
    }

    const updateStatus = () => {
      const now = Date.now();
      const elapsedMs = now - lastUpdate;
      const elapsedMin = Math.floor(elapsedMs / 60000);

      if (elapsedMin > 20) {
        setStatus(t('hooks.useLastUpdateChecker.criticalError'));
      } else if (elapsedMin < 3) {
        setStatus(t('hooks.useLastUpdateChecker.justNow'));
      } else {
        setStatus(
          t('hooks.useLastUpdateChecker.minAgo', {
            minutes: elapsedMin + 1,
          }),
        );
      }
    };

    updateStatus();

    const intervalId = setInterval(updateStatus, 60000);

    return () => clearInterval(intervalId);
  }, [isUpdateBalanceLoading, lastUpdate, t]);

  return status;
}
