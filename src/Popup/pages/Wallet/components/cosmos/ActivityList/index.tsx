import { useMemo } from 'react';
import { Typography } from '@mui/material';

import EmptyAsset from '~/Popup/components/EmptyAsset';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useActivitiesSWR } from '~/Popup/hooks/SWR/cosmos/useActivitiesSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { formatDate } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Activity } from '~/types/cosmos/activity';

import ActivityItem from './components/ActivityItem';
import {
  ActivityContainer,
  ActivityDateContainer,
  ActivityListContainer,
  ActivityWrapperContainer,
  Container,
  ContentsContainer,
  EmptyAssetContainer,
} from './styled';

import HistoryIcon from '~/images/icons/History.svg';

type ActivityListProps = {
  chain: CosmosChain;
};

export default function ActivityList({ chain }: ActivityListProps) {
  const { t } = useTranslation();

  const activities = useActivitiesSWR(chain);

  const flattenedActivities = useMemo<Activity[]>(
    () => (activities.data?.flatMap((item) => item).filter((item) => item) as Activity[]) || [],
    [activities.data],
  );

  const activitiesGroupedByDate = useMemo(() => {
    const formattedDates = flattenedActivities.map((item) => formatDate(item?.data?.timestamp)).filter((item) => !!item);

    const uniqueFormattedDates = formattedDates.filter((v, i, a) => a.indexOf(v) === i);

    return uniqueFormattedDates.map((uniqueFormattedDate) => {
      const filteredActivites = flattenedActivities.filter((activity) => {
        if (!activity?.data?.timestamp) {
          return false;
        }

        return formatDate(activity.data.timestamp) === uniqueFormattedDate;
      });

      return {
        [uniqueFormattedDate]: filteredActivites,
      };
    });
  }, [flattenedActivities]);

  const isExistActivity = useMemo(() => !!activitiesGroupedByDate.length, [activitiesGroupedByDate.length]);

  return (
    <Container>
      <ContentsContainer>
        {isExistActivity ? (
          <ActivityWrapperContainer>
            {activitiesGroupedByDate.map((item) => {
              const date = Object.keys(item)[0];
              const activitiesByDate = item[date];

              return (
                <ActivityContainer key={date}>
                  <ActivityDateContainer>
                    <Typography variant="h5">{date}</Typography>
                  </ActivityDateContainer>
                  <ActivityListContainer>
                    {activitiesByDate.map((activity) => activity && <ActivityItem key={activity.data?.txhash} chain={chain} activity={activity} />)}
                  </ActivityListContainer>
                </ActivityContainer>
              );
            })}
            <IntersectionObserver
              onIntersect={async () => {
                if (activities.size === activities.data?.length) {
                  await activities.setSize((prevSize) => prevSize + 1);
                }
              }}
            />
          </ActivityWrapperContainer>
        ) : (
          <EmptyAssetContainer>
            <EmptyAsset
              Icon={HistoryIcon}
              headerText={t('pages.Wallet.components.cosmos.ActivityList.index.defaultHeader')}
              subHeaderText={t('pages.Wallet.components.cosmos.ActivityList.index.defaultSubHeader')}
            />
          </EmptyAssetContainer>
        )}
      </ContentsContainer>
    </Container>
  );
}
