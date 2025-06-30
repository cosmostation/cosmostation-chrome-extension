import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUpdateBalance } from '@/hooks/update/useUpdateBalance';
import type { DataFreshnessType } from '@/types/dataFreshness';
import { checkDataFreshness } from '@/utils/date';

import { IconContainer } from './styled';
import Tooltip from '../common/Tooltip';

import CautionIcon from '@/assets/images/icons/Caution16.svg';

export type BalanceSyncStatusIconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  lastUpdatedAtMs?: number | null;
};

export default function BalanceSyncStatusIcon({ lastUpdatedAtMs, ...remainder }: BalanceSyncStatusIconProps) {
  const { t } = useTranslation();
  const { isLoading: isUpdateBalanceLoading } = useUpdateBalance();
  const [freshnessStatus, setFreshnessStatus] = useState<DataFreshnessType | undefined>();

  const tooltipMessage = useMemo(() => {
    if (!freshnessStatus || freshnessStatus === 'fresh') return null;
    if (freshnessStatus === 'warning') return t('components.BalanceSyncStatusIcon.index.warning');
    if (freshnessStatus === 'stale') return t('components.BalanceSyncStatusIcon.index.stale');
  }, [freshnessStatus, t]);

  useEffect(() => {
    if (!lastUpdatedAtMs) return;

    const update = () => {
      setFreshnessStatus(checkDataFreshness(lastUpdatedAtMs));
    };

    update();

    const interval = setInterval(update, 30000);

    return () => clearInterval(interval);
  }, [lastUpdatedAtMs]);

  if (!tooltipMessage || isUpdateBalanceLoading) return null;

  return (
    <Tooltip title={tooltipMessage} varient="error" placement="top">
      <IconContainer data-sync-status={freshnessStatus} {...remainder}>
        <CautionIcon />
      </IconContainer>
    </Tooltip>
  );
}
