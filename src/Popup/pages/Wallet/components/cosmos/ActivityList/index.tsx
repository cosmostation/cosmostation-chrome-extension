import { useMemo } from 'react';

import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosActivity } from '~/Popup/hooks/useCurrent/useCurrentCosmosActivity';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';

import ActivityItem from './components/ActivityItem';
import { Container, EmptyAssetContainer, ListContainer } from './styled';

import HistoryIcon from '~/images/icons/History.svg';

type ActivityListProps = {
  chain: CosmosChain;
};

export default function ActivityList({ chain }: ActivityListProps) {
  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );
  const { currentCosmosActivity } = useCurrentCosmosActivity();

  const filteredCosmosActivity = useMemo(
    () => currentCosmosActivity.filter((item) => isEqualsIgnoringCase(item.address, currentAddress)),
    [currentAddress, currentCosmosActivity],
  );

  const isExistActivity = useMemo(() => filteredCosmosActivity.length, [filteredCosmosActivity.length]);

  return (
    <Container>
      <ListContainer>
        {isExistActivity ? (
          currentCosmosActivity
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
