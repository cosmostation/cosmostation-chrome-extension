import { useMemo } from 'react';

import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useCurrentCosmosActivity } from '~/Popup/hooks/useCurrent/useCurrentCosmosActivity';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';

import ActivityItem from './components/ActivityItem';
import { Container, EmptyAssetContainer, ListContainer } from './styled';

import HistoryIcon from '~/images/icons/History.svg';

type ActivityListProps = {
  chain: CosmosChain;
};

export default function ActivityList({ chain }: ActivityListProps) {
  const { t } = useTranslation();

  const { currentCosmosActivities } = useCurrentCosmosActivity();

  const isExistActivity = useMemo(() => currentCosmosActivities.length, [currentCosmosActivities.length]);

  return (
    <Container>
      <ListContainer>
        {isExistActivity ? (
          currentCosmosActivities
            .sort((a, b) => (gt(a.timestamp, b.timestamp) ? -1 : 1))
            .map((activity) => <ActivityItem key={activity.txHash} chain={chain} activity={activity} />)
        ) : (
          <EmptyAssetContainer>
            <EmptyAsset
              Icon={HistoryIcon}
              headerText={t('pages.Wallet.components.cosmos.ActivityList.index.defaultHeader')}
              subHeaderText={t('pages.Wallet.components.cosmos.ActivityList.index.defaultSubHeader')}
            />
          </EmptyAssetContainer>
        )}
      </ListContainer>
    </Container>
  );
}
