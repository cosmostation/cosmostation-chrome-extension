import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';

import { Container, ItemContainer } from './styled';

export default function EpochIndicator() {
  const { t } = useTranslation();

  const currentEpoch = 600;

  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    // TODO 실제 리워드 분배 시간으로 수정 필요.
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const diff = endOfDay.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setRemainingTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      } else {
        setRemainingTime('00:00:00');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Container>
      <ItemContainer>
        <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.entry.Sui.components.EpochIndicator.index.currentEpoch')}</Base1000Text>
        <Base1300Text variant="h3n_B">{`#${currentEpoch}`}</Base1300Text>
      </ItemContainer>
      <ItemContainer>
        <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.entry.Sui.components.EpochIndicator.index.nextRewardShare')}</Base1000Text>
        <Base1300Text variant="h3n_B">{remainingTime}</Base1300Text>
      </ItemContainer>
    </Container>
  );
}
