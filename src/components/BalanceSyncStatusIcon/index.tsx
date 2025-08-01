import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TooltipProps } from '@mui/material/Tooltip';

import { useUpdateBalance } from '@/hooks/update/useUpdateBalance';
import type { DataFreshnessType } from '@/types/dataFreshness';
import { checkDataFreshness } from '@/utils/date';

import { IconContainer } from './styled';
import Tooltip from '../common/Tooltip';

import CautionIcon from '@/assets/images/icons/Caution16.svg';

export type BalanceSyncStatusIconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  lastUpdatedAtMs?: number | null;
  tooltipProps?: TooltipProps;
};

export default function BalanceSyncStatusIcon({ lastUpdatedAtMs, tooltipProps, ...remainder }: BalanceSyncStatusIconProps) {
  const { t } = useTranslation();
  const { isLoading: isUpdateBalanceLoading, isFetching: isUpdateBalanceFetching, isAutoRefetchPaused } = useUpdateBalance();
  const [freshnessStatus, setFreshnessStatus] = useState<DataFreshnessType | undefined>();

  const tooltipMessage = useMemo(() => {
    if (!freshnessStatus || freshnessStatus === 'fresh') return null;
    if (freshnessStatus === 'warning') return t('components.BalanceSyncStatusIcon.index.warning');
    if (freshnessStatus === 'stale') return t('components.BalanceSyncStatusIcon.index.stale');
  }, [freshnessStatus, t]);

  const tooltipVarient = useMemo(() => {
    if (freshnessStatus === 'warning') return 'warning';
    if (freshnessStatus === 'stale') return 'error';

    return 'basic';
  }, [freshnessStatus]);

  useEffect(() => {
    if (!lastUpdatedAtMs) return;

    const update = () => {
      setFreshnessStatus(checkDataFreshness(lastUpdatedAtMs));
    };

    update();

    const interval = setInterval(update, 30000);

    return () => clearInterval(interval);
  }, [lastUpdatedAtMs]);

  if (!tooltipMessage || isUpdateBalanceLoading || isUpdateBalanceFetching || isAutoRefetchPaused) return null;

  return (
    <Tooltip title={tooltipMessage} varient={tooltipVarient} placement="top" style={{ height: '1.6rem' }} {...tooltipProps}>
      <IconContainer data-sync-status={freshnessStatus} {...remainder}>
        <CautionIcon />
      </IconContainer>
    </Tooltip>
  );
}
