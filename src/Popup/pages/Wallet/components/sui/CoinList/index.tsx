import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import { SUI_COIN } from '~/constants/sui';
import AddButton from '~/Popup/components/AddButton';
import Empty from '~/Popup/components/common/Empty';
import { useGetObjectsOwnedByAddressSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsOwnedByAddressSWR';
import { useGetObjectsSWR } from '~/Popup/hooks/SWR/sui/useGetObjectsSWR';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { plus } from '~/Popup/utils/big';
import { getCoinAddress, isExists } from '~/Popup/utils/sui';
import type { Path } from '~/types/route';

import CoinItem, { CoinItemSkeleton } from './components/CoinItem';
import {
  AddTokenButton,
  AddTokenTextContainer,
  Container,
  ListContainer,
  ListTitleContainer,
  ListTitleLeftContainer,
  ListTitleLeftCountContainer,
  ListTitleLeftTextContainer,
  ListTitleRightContainer,
} from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

export default function CoinList() {
  const { navigate } = useNavigate();
  const { t } = useTranslation();

  const { data: objectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({}, { suspense: true });
  const { data: objects } = useGetObjectsSWR({ objectIds: objectsOwnedByAddress?.result?.map((object) => object.objectId) });

  const filteredObjects = useMemo(
    () => objects?.filter(isExists).filter((object) => getCoinAddress(object.result?.details.data.type || '') !== SUI_COIN) || [],
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
        <ListTitleRightContainer>
          {isExistToken && (
            <AddButton type="button" onClick={() => navigate('/chain/aptos/coin/add')}>
              {t('pages.Wallet.components.aptos.CoinList.index.addCoinButton')}
            </AddButton>
          )}
        </ListTitleRightContainer>
      </ListTitleContainer>
      <ListContainer>
        {isExistToken ? (
          filteredCoins.map((coin) => (
            <ErrorBoundary key={coin.type} FallbackComponent={Empty}>
              <Suspense fallback={<CoinItemSkeleton coin={coin} />}>
                <CoinItem coin={coin} onClick={() => navigate(`/wallet/send/${coin.type}` as unknown as Path)} />
              </Suspense>
            </ErrorBoundary>
          ))
        ) : (
          <AddTokenButton type="button" onClick={() => navigate('/chain/aptos/coin/add')}>
            <Plus16Icon />
            <AddTokenTextContainer>
              <Typography variant="h6">{t('pages.Wallet.components.aptos.CoinList.index.addCoinButton')}</Typography>
            </AddTokenTextContainer>
          </AddTokenButton>
        )}
      </ListContainer>
    </Container>
  );
}
