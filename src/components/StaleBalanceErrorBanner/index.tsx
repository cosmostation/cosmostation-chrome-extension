import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Collapse from '@mui/material/Collapse';

import Base1300Text from '@/components/common/Base1300Text';
import { useManualBalanceUpdate } from '@/hooks/common/useManualBalanceUpdate';
import { useUpdateBalance } from '@/hooks/update/useUpdateBalance';
import type { UniqueChainId } from '@/types/chain';
import type { DataFreshnessType } from '@/types/dataFreshness';
import { checkDataFreshness } from '@/utils/date';

import { Container, StyledIconContainer, TitleTextContainer } from './styled';
import IconTextButton from '../common/IconTextButton';

import CautionIcon from '@/assets/images/icons/Caution16.svg';
import RefreshIcon from '@/assets/images/icons/Refresh18.svg';

type StaleBalanceErrorBannerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  chainId: UniqueChainId;
  address?: string;
  lastUpdatedAtMs?: number | null;
};

export default function StaleBalanceErrorBanner({ lastUpdatedAtMs, chainId, address, ...remainer }: StaleBalanceErrorBannerProps) {
  const { t } = useTranslation();
  const { updateChainBalance, isLoadingChainBalance } = useManualBalanceUpdate();
  const { isLoading: isUpdateBalanceLoading, fetchStatus } = useUpdateBalance();
  const [freshnessStatus, setFreshnessStatus] = useState<DataFreshnessType | undefined>();

  const title = useMemo(() => {
    if (!freshnessStatus || freshnessStatus === 'fresh') return null;
    if (freshnessStatus === 'warning') return t('components.StaleBalanceErrorBanner.index.warning');
    if (freshnessStatus === 'stale') return t('components.StaleBalanceErrorBanner.index.stale');
  }, [freshnessStatus, t]);

  const handleOnClick = async () => {
    if (freshnessStatus === 'warning' && address) {
      await updateChainBalance(chainId, address);
    }
  };

  useEffect(() => {
    if (!lastUpdatedAtMs) return;

    const update = () => {
      setFreshnessStatus(checkDataFreshness(lastUpdatedAtMs));
    };

    update();

    const interval = setInterval(update, 60000);

    return () => clearInterval(interval);
  }, [lastUpdatedAtMs]);

  return (
    <Collapse in={!!title && !isUpdateBalanceLoading && fetchStatus !== 'idle' && (freshnessStatus === 'warning' || freshnessStatus === 'stale')}>
      <Container data-variant={freshnessStatus} {...remainer}>
        <TitleTextContainer>
          <CautionIcon />
          <Base1300Text variant="b4_B">{title}</Base1300Text>
        </TitleTextContainer>

        {freshnessStatus === 'warning' && (
          <IconTextButton
            onClick={handleOnClick}
            leadingIcon={
              <StyledIconContainer data-is-loading={isLoadingChainBalance}>
                <RefreshIcon />
              </StyledIconContainer>
            }
          >
            <Base1300Text variant="b4_B">{t('components.StaleBalanceErrorBanner.index.refresh')}</Base1300Text>
          </IconTextButton>
        )}
      </Container>
    </Collapse>
  );
}
