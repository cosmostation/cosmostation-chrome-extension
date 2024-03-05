import { useMemo } from 'react';

import EmptyAsset from '~/Popup/components/EmptyAsset';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useActivitiesSWR } from '~/Popup/hooks/SWR/cosmos/useActivitiesSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';

import ActivityItem from './components/ActivityItem';
import { Container, EmptyAssetContainer, ListContainer } from './styled';

import HistoryIcon from '~/images/icons/History.svg';

type ActivityListProps = {
  chain: CosmosChain;
};

export default function ActivityList({ chain }: ActivityListProps) {
  const { t } = useTranslation();

  const activities = useActivitiesSWR(chain);

  const flattenedActivities = useMemo(() => activities.data?.flatMap((item) => item) || [], [activities.data]);

  const isExistActivity = useMemo(() => !!flattenedActivities.length, [flattenedActivities.length]);

  return (
    <Container>
      <ListContainer>
        {isExistActivity ? (
          <>
            {flattenedActivities.map((item) => item && <ActivityItem key={item.data?.txhash} chain={chain} activity={item} />)}

            <IntersectionObserver
              onIntersect={async () => {
                if (activities.size === activities.data?.length) {
                  await activities.setSize((prevSize) => prevSize + 1);
                }
              }}
            />
          </>
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
