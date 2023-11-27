import { useMemo } from 'react';

import { EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useTokensSWR } from '~/Popup/hooks/SWR/ethereum/useTokensSWR';
import { useCurrentActivity } from '~/Popup/hooks/useCurrent/useCurrentActivity';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, toDisplayDenomAmount } from '~/Popup/utils/big';

import ActivityItem from './components/ActivityItem';
import { Container, EmptyAssetContainer, ListContainer } from './styled';

import HistoryIcon from '~/images/icons/History.svg';

export default function ActivityList() {
  const { t } = useTranslation();

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const tokens = useTokensSWR();
  const { currentEthereumTokens } = useCurrentEthereumTokens();

  const { currentActivitiy } = useCurrentActivity();

  const sortedCurrentActivities = useMemo(() => currentActivitiy.sort((a, b) => (gt(a.timestamp, b.timestamp) ? -1 : 1)), [currentActivitiy]);

  const isExistActivity = useMemo(() => !!currentActivitiy.length, [currentActivitiy.length]);

  const allTokens = useMemo(
    () => [
      ...tokens.data,
      ...currentEthereumTokens.map((token) => ({
        displayDenom: token.displayDenom,
        decimals: token.decimals,
        address: token.address,
        name: token.name,
        imageURL: token.imageURL,
        coinGeckoId: token.coinGeckoId,
      })),
    ],
    [currentEthereumTokens, tokens.data],
  );

  return (
    <Container>
      <ListContainer>
        {isExistActivity ? (
          sortedCurrentActivities.map((activity) => {
            const itemBaseAmount = activity.amount?.[0].amount || '0';

            const itemBaseDenom = activity.amount?.[0].denom || '';

            const assetCoinInfo = allTokens.find((token) => token.address === activity.amount?.[0].denom);

            const decimals = (() => {
              if (itemBaseDenom === EVM_NATIVE_TOKEN_ADDRESS) {
                return currentEthereumNetwork.decimals;
              }

              if (assetCoinInfo?.decimals) {
                return assetCoinInfo.decimals;
              }

              return undefined;
            })();

            const itemDisplayAmount = decimals ? toDisplayDenomAmount(itemBaseAmount, decimals) : '0';

            const itemDisplayDenom = (() => {
              if (itemBaseDenom === EVM_NATIVE_TOKEN_ADDRESS) {
                return currentEthereumNetwork.displayDenom;
              }

              if (assetCoinInfo?.displayDenom) {
                return assetCoinInfo.displayDenom;
              }

              return itemBaseDenom.length > 5 ? `${itemBaseDenom.substring(0, 5)}...` : itemBaseDenom;
            })();

            return (
              <ActivityItem key={activity.txHash} activity={activity} displayAmount={itemDisplayAmount} displayDenom={itemDisplayDenom} decimals={decimals} />
            );
          })
        ) : (
          <EmptyAssetContainer>
            <EmptyAsset
              Icon={HistoryIcon}
              headerText={t('pages.Wallet.components.ethereum.ActivityList.index.defaultHeader')}
              subHeaderText={t('pages.Wallet.components.ethereum.ActivityList.index.defaultSubHeader')}
            />
          </EmptyAssetContainer>
        )}
      </ListContainer>
    </Container>
  );
}
