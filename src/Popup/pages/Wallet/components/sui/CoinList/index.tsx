import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import { SUI } from '~/constants/chain/sui/sui';
import Empty from '~/Popup/components/common/Empty';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/sui/useTokenBalanceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
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
  const chain = SUI;

  const { navigate } = useNavigate();
  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { filteredTokenBalanceObjects } = useTokenBalanceSWR({ address: currentAddress });

  const isExistToken = filteredTokenBalanceObjects && !!filteredTokenBalanceObjects.length;

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
            <Typography variant="h6">{isExistToken ? `${filteredTokenBalanceObjects.length}` : ''}</Typography>
          </ListTitleLeftCountContainer>
        </ListTitleLeftContainer>
        <ListTitleRightContainer />
      </ListTitleContainer>
      <ListContainer>
        {filteredTokenBalanceObjects.map((coin) => (
          <ErrorBoundary key={coin.coinType} FallbackComponent={Empty}>
            <Suspense fallback={<CoinItemSkeleton coin={coin} />}>
              <CoinItem coin={coin} onClick={() => navigate(`/wallet/send/${coin.coinType}` as unknown as Path)} />
            </Suspense>
          </ErrorBoundary>
        ))}
      </ListContainer>
    </Container>
  );
}
