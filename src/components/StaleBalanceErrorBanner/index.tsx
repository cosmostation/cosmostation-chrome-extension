import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Collapse from '@mui/material/Collapse';

import Base1300Text from '@/components/common/Base1300Text';
import { useAutoBalanceRefresh } from '@/hooks/update/useAutoBalanceRefresh';
import type { RequestStatus } from '@/types/account';
import type { UniqueChainId } from '@/types/chain';

import { Container, TitleTextContainer } from './styled';

import CautionIcon from '@/assets/images/icons/Caution16.svg';

type StaleBalanceErrorBannerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  chainId?: UniqueChainId;
  fetchStatus?: RequestStatus;
};

export default function StaleBalanceErrorBanner({ fetchStatus, chainId, ...remainer }: StaleBalanceErrorBannerProps) {
  const { t } = useTranslation();
  const { isLoading: isUpdateChainBalanceLoading } = useAutoBalanceRefresh(chainId && [chainId]);

  const currentStatus = useMemo(() => {
    if (fetchStatus === 'error') {
      if (isUpdateChainBalanceLoading) {
        return 'updating';
      }
      return 'error';
    }
    return undefined;
  }, [fetchStatus, isUpdateChainBalanceLoading]);

  const title = useMemo(() => {
    if (currentStatus === 'updating') return t('components.StaleBalanceErrorBanner.index.warning');
    if (currentStatus === 'error') return t('components.StaleBalanceErrorBanner.index.stale');

    return undefined;
  }, [currentStatus, t]);

  return (
    <Collapse in={!!title && !!chainId && fetchStatus === 'error'}>
      <Container data-variant={currentStatus} {...remainer}>
        <TitleTextContainer>
          <CautionIcon />
          <Base1300Text variant="b4_B">{title}</Base1300Text>
        </TitleTextContainer>
      </Container>
    </Collapse>
  );
}
