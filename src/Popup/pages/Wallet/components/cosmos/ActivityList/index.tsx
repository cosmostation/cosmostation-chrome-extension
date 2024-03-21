import { useMemo } from 'react';
import { Typography } from '@mui/material';

import EmptyAsset from '~/Popup/components/EmptyAsset';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useActivitiesSWR } from '~/Popup/hooks/SWR/cosmos/useActivitiesSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
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
    const activityDates = flattenedActivities
      .map((item) => item?.data?.timestamp)
      .map((item) => {
        if (!item) {
          return '';
        }

        // TODO 데이트 변환 로직 간소화
        const date = new Date(item);

        const year = date.getFullYear();
        const month = `0${date.getMonth() + 1}`.slice(-2);
        const day = `0${date.getDate()}`.slice(-2);

        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate;
      });

    const uniqueActivityDates = activityDates.filter((v, i, a) => a.indexOf(v) === i);

    const activitiesByDate = uniqueActivityDates.map((item) => {
      const filtered = flattenedActivities.filter((item2) => {
        if (!item2?.data?.timestamp) {
          return false;
        }

        const date = new Date(item2.data.timestamp);

        const year = date.getFullYear();
        const month = `0${date.getMonth() + 1}`.slice(-2);
        const day = `0${date.getDate()}`.slice(-2);

        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate === item;
      });

      return {
        [item]: filtered,
      };
    });

    return activitiesByDate;
  }, [flattenedActivities]);

  const isExistActivity = useMemo(() => !!activitiesGroupedByDate.length, [activitiesGroupedByDate.length]);

  return (
    <Container>
      <ContentsContainer>
        {isExistActivity ? (
          <>
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
            </ActivityWrapperContainer>
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
      </ContentsContainer>
    </Container>
  );
}
