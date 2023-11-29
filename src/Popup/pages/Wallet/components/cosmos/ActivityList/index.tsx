import { useMemo } from 'react';

import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useCurrentActivity } from '~/Popup/hooks/useCurrent/useCurrentActivity';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, toDisplayDenomAmount } from '~/Popup/utils/big';
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

  const { currentActivitiy } = useCurrentActivity();

  const assets = useAssetsSWR(chain);

  const sortedCurrentActivities = useMemo(() => currentActivitiy.sort((a, b) => (gt(a.timestamp, b.timestamp) ? -1 : 1)), [currentActivitiy]);

  const isExistActivity = useMemo(() => !!currentActivitiy.length, [currentActivitiy.length]);

  return (
    <Container>
      <ListContainer>
        {isExistActivity ? (
          sortedCurrentActivities.map((activity) => {
            const itemBaseAmount = activity.amount?.[0]?.amount || '0';
            const itemBaseDenom = activity.amount?.[0]?.denom || '';

            const assetCoinInfo = assets.data.find((coin) => isEqualsIgnoringCase(coin.denom, itemBaseDenom));

            const itemDisplayAmount = assetCoinInfo?.decimals ? toDisplayDenomAmount(itemBaseAmount, assetCoinInfo.decimals) : '0';

            const itemDisplayDenom = (() => {
              if (assetCoinInfo?.symbol) {
                return assetCoinInfo.symbol;
              }

              return itemBaseDenom.length > 5 ? `${itemBaseDenom.substring(0, 5)}...` : itemBaseDenom;
            })();

            return <ActivityItem key={activity.txHash} chain={chain} activity={activity} displayAmount={itemDisplayAmount} displayDenom={itemDisplayDenom} />;
          })
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
