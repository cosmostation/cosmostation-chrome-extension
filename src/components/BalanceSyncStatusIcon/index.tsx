import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TooltipProps } from '@mui/material';

import type { RequestStatus } from '@/types/account';

import { IconContainer } from './styled';
import Tooltip from '../common/Tooltip';

import CautionIcon from '@/assets/images/icons/Caution16.svg';

export type BalanceSyncStatusIconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  fetchStatus?: RequestStatus;
  tooltipProps?: TooltipProps;
};

export default function BalanceSyncStatusIcon({ fetchStatus, tooltipProps, ...remainder }: BalanceSyncStatusIconProps) {
  const { t } = useTranslation();

  const tooltipMessage = useMemo(() => {
    if (fetchStatus === 'error') return t('components.BalanceSyncStatusIcon.index.stale');

    return null;
  }, [fetchStatus, t]);

  return (
    fetchStatus === 'error' && (
      <Tooltip title={tooltipMessage} varient={fetchStatus} placement="top" style={{ height: '1.6rem' }} {...tooltipProps}>
        <IconContainer data-sync-status={fetchStatus} {...remainder}>
          <CautionIcon />
        </IconContainer>
      </Tooltip>
    )
  );
}
