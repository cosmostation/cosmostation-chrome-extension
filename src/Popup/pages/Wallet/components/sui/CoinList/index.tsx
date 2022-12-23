import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import { SUI_COIN } from '~/constants/sui';
import Empty from '~/Popup/components/common/Empty';
import { useGetObjectsOwnedByAddressSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsOwnedByAddressSWR';
import { useGetObjectsSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsSWR';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { plus } from '~/Popup/utils/big';
import { getCoinType, isExists } from '~/Popup/utils/sui';
import type { Path } from '~/types/route';

import CoinItem, { CoinItemSkeleton } from './components/CoinItem';
import {
  Container,
  ListContainer,
  ListTitleContainer,
  ListTitleLeftContainer,
  ListTitleLeftCountContainer,
  ListTitleLeftTextContainer,
  ListTitleRightContainer,
} from './styled';

export default function CoinList() {
  const { navigate } = useNavigate();
  const { t } = useTranslation();

  const { data: objectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({});
  const { data: objects } = useGetObjectsSWR({ objectIds: objectsOwnedByAddress?.result?.map((object) => object.objectId) });

  const filteredObjects = useMemo(
    () =>
      objects
        ?.filter(isExists)
        .filter((object) => getCoinType(object.result?.details.data.type || '') !== SUI_COIN && !!object.result?.details.data.fields.balance) || [],
    [objects],
  );

  const filteredCoins = useMemo(() => {
    const reducedCoins = filteredObjects.reduce<Record<string, string>>((prev, cur) => {
      if (cur.result) {
        if (prev[cur.result.details.data.type]) {
          return { ...prev, [cur.result.details.data.type]: plus(prev[cur.result.details.data.type], cur.result.details.data.fields.balance) };
        }

        return { ...prev, [cur.result.details.data.type]: String(cur.result.details.data.fields.balance) };
      }

      return prev;
    }, {});

    const reducedCoinsKeys = Object.keys(reducedCoins);

    return reducedCoinsKeys.map((key) => ({ type: key, amount: reducedCoins[key] }));
  }, [filteredObjects]);

  const isExistToken = !!filteredCoins.length;

  if (!isExistToken) {
    return null;
  }

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <ListTitleLeftTextContainer>
            <Typography variant="h6">{t('pages.Wallet.components.aptos.CoinList.index.coin')}</Typography>
          </ListTitleLeftTextContainer>
          <ListTitleLeftCountContainer>
            <Typography variant="h6">{isExistToken ? `${filteredCoins.length}` : ''}</Typography>
          </ListTitleLeftCountContainer>
        </ListTitleLeftContainer>
        <ListTitleRightContainer />
      </ListTitleContainer>
      <ListContainer>
        {filteredCoins.map((coin) => (
          <ErrorBoundary key={coin.type} FallbackComponent={Empty}>
            <Suspense fallback={<CoinItemSkeleton coin={coin} />}>
              <CoinItem coin={coin} onClick={() => navigate(`/wallet/send/${coin.type}` as unknown as Path)} />
            </Suspense>
          </ErrorBoundary>
        ))}
      </ListContainer>
    </Container>
  );
}
