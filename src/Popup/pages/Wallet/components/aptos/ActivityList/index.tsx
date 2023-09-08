import { useMemo } from 'react';

import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useCurrentActivity } from '~/Popup/hooks/useCurrent/useCurrentActivity';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';

import ActivityItem from './components/ActivityItem';
import { Container, EmptyAssetContainer, ListContainer } from './styled';

import HistoryIcon from '~/images/icons/History.svg';

export default function ActivityList() {
  const { t } = useTranslation();

  const { currentActivitiy } = useCurrentActivity();

  const sortedCurrentActivities = useMemo(() => currentActivitiy.sort((a, b) => (gt(a.timestamp, b.timestamp) ? -1 : 1)), [currentActivitiy]);

  const isExistActivity = useMemo(() => !!currentActivitiy.length, [currentActivitiy.length]);

  return (
    <Container>
      <ListContainer>
        {isExistActivity ? (
          sortedCurrentActivities.map((activity) => <ActivityItem key={activity.txHash} activity={activity} />)
        ) : (
          <EmptyAssetContainer>
            <EmptyAsset
              Icon={HistoryIcon}
              headerText={t('pages.Wallet.components.aptos.ActivityList.index.defaultHeader')}
              subHeaderText={t('pages.Wallet.components.aptos.ActivityList.index.defaultSubHeader')}
            />
          </EmptyAssetContainer>
        )}
      </ListContainer>
    </Container>
  );
}
