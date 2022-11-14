import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import Empty from '~/Popup/components/common/Empty';
import { useCurrentAptosCoins } from '~/Popup/hooks/useCurrent/useCurrentAptosCoins';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
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

  const { currentAptosCoins } = useCurrentAptosCoins();

  const filteredCurrentAptosCoins = useMemo(() => currentAptosCoins.filter((item) => !item.type.includes('0x1::aptos_coin::AptosCoin')), [currentAptosCoins]);

  const isExistToken = !!filteredCurrentAptosCoins.length;

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <ListTitleLeftTextContainer>
            <Typography variant="h6">{t('pages.Wallet.components.aptos.CoinList.index.coin')}</Typography>
          </ListTitleLeftTextContainer>
          <ListTitleLeftCountContainer>
            <Typography variant="h6">{isExistToken ? `${filteredCurrentAptosCoins.length}` : ''}</Typography>
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
          filteredCurrentAptosCoins.map((coin) => (
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
