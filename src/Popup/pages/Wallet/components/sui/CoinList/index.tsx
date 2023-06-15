import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import { SUI_COIN } from '~/constants/sui';
import Empty from '~/Popup/components/common/Empty';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useTokenBalanceObjectsSWR } from '~/Popup/hooks/SWR/sui/useTokenBalanceObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { SuiChain } from '~/types/chain';
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

import NoCoinIcon from '~/images/icons/NoCoin.svg';

type CoinListProps = {
  chain: SuiChain;
};

export default function CoinList({ chain }: CoinListProps) {
  const { navigate } = useNavigate();
  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { tokenBalanceObjects } = useTokenBalanceObjectsSWR({ address: currentAddress });

  const tokenList = useMemo(() => tokenBalanceObjects.filter((item) => item.coinType !== SUI_COIN), [tokenBalanceObjects]);

  const isExistToken = !!tokenList.length;

  if (!isExistToken) {
    return <EmptyAsset style={{ marginTop: '8.5rem' }} Icon={NoCoinIcon} headerText="No Coins" subHeaderText="Recent Coins will show up here" />;
  }

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <ListTitleLeftTextContainer>
            <Typography variant="h6">{t('pages.Wallet.components.sui.CoinList.index.coin')}</Typography>
          </ListTitleLeftTextContainer>
          <ListTitleLeftCountContainer>
            <Typography variant="h6">{isExistToken ? `${tokenList.length}` : ''}</Typography>
          </ListTitleLeftCountContainer>
        </ListTitleLeftContainer>
        <ListTitleRightContainer />
      </ListTitleContainer>
      <ListContainer>
        {tokenList.map((coin) => (
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
