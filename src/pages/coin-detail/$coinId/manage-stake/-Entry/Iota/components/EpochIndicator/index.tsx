import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useGetLatestIotaSystemState } from '@/hooks/iota/useGetLatestIotaSystemState';
import { minus, plus } from '@/utils/numbers';

import { Container, DistributionCountContainer, EpochContainer } from './styled';

type EpochIndicatorProps = {
  coinId: string;
};

export default function EpochIndicator({ coinId }: EpochIndicatorProps) {
  const { t, i18n } = useTranslation();
  const { data: latestSystemState } = useGetLatestIotaSystemState({ coinId });

  const currentEpoch = latestSystemState?.result?.epoch || '-';

  const epochStartTimestampMs = latestSystemState?.result?.epochStartTimestampMs || '0';
  const epochDurationMs = latestSystemState?.result?.epochDurationMs || '0';

  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDayTimestampMs = plus(epochStartTimestampMs, epochDurationMs);

      const diff = Number(minus(endOfDayTimestampMs, now.getTime()));

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (i18n.resolvedLanguage === 'ko') {
          setRemainingTime(`${String(hours).padStart(2, '0')}시 :${String(minutes).padStart(2, '0')}분 :${String(seconds).padStart(2, '0')}초 후,`);
        } else {
          setRemainingTime(`After ${String(hours).padStart(2, '0')}h :${String(minutes).padStart(2, '0')}m :${String(seconds).padStart(2, '0')}s,`);
        }
      } else {
        setRemainingTime('00:00:00');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [epochDurationMs, epochStartTimestampMs, i18n.resolvedLanguage]);

  return (
    <Container>
      <DistributionCountContainer>
        <Base1300Text variant="b2_B">{remainingTime}</Base1300Text>
        <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.entry.Iota.components.EpochIndicator.index.nextRewardShare')}</Base1000Text>
      </DistributionCountContainer>

      <EpochContainer>
        <Base1000Text variant="b4_R">{t('pages.coin-detail.$coinId.manage-stake.entry.Iota.components.EpochIndicator.index.currentEpoch')}</Base1000Text>
        <Base1300Text variant="b2_B">{`#${currentEpoch}`}</Base1300Text>
      </EpochContainer>
    </Container>
  );
}
