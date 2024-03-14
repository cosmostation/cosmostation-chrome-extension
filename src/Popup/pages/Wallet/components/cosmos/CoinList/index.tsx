import { Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';
import type { Path } from '~/types/route';

import CoinItem from './components/CoinItem';
import TokenItem, { TokenItemError, TokenItemSkeleton } from './components/TokenItem';
import TypeButton from './components/TypeButton';
import type { TypeInfo } from './components/TypePopover';
import TypePopover from './components/TypePopover';
import { AddTokenButton, AddTokenTextContainer, Container, ListContainer, ListTitleContainer, ListTitleLeftContainer, ListTitleRightContainer } from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

type CoinListProps = {
  chain: CosmosChain;
};

export default function CoinList({ chain }: CoinListProps) {
  const { coins, ibcCoins } = useCoinListSWR(chain);

  const { extensionStorage } = useExtensionStorage();
  const { t } = useTranslation();

  const accounts = useAccounts(true);

  const address = accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const { currentCosmosTokens, removeCosmosToken } = useCurrentCosmosTokens(chain);

  const nativeCoinCnt = useMemo(() => coins.filter((coin) => coin.coinType === 'native').length, [coins]);
  const bridgedCoinCnt = useMemo(() => coins.filter((coin) => coin.coinType === 'bridge').length, [coins]);
  const ibcCointCnt = ibcCoins.length;
  const tokenCnt = currentCosmosTokens.length;

  const sortedNativeCoins = useMemo(
    () => coins.filter((coin) => coin.coinType === 'native').sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)),
    [coins],
  );
  const sortedBridgedCoins = useMemo(
    () => coins.filter((coin) => coin.coinType === 'bridge').sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)),
    [coins],
  );
  const sortedIbcCoins = useMemo(() => ibcCoins.sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)), [ibcCoins]);

  const sortedTokens = useMemo(
    () => [
      ...currentCosmosTokens.filter((item) => item.default),
      ...currentCosmosTokens.filter((item) => !item.default).sort((a, b) => a.displayDenom.localeCompare(b.displayDenom)),
    ],
    [currentCosmosTokens],
  );

  const typeInfos = useMemo(() => {
    const infos: TypeInfo[] = [];

    infos.push({ type: 'all', name: 'All Assets', count: nativeCoinCnt + bridgedCoinCnt + ibcCointCnt + tokenCnt });

    if (nativeCoinCnt) {
      infos.push({ type: 'native', name: 'Native Coins', count: nativeCoinCnt });
    }

    if (bridgedCoinCnt) {
      infos.push({ type: 'bridge', name: 'Bridged Coins', count: bridgedCoinCnt });
    }

    if (ibcCointCnt) {
      infos.push({ type: 'ibc', name: 'IBC Coins', count: ibcCointCnt });
    }

    if (tokenCnt && chain.cosmWasm) {
      infos.push({ type: 'cw20', name: 'CW20 Tokens', count: tokenCnt });
    }

    return infos;
  }, [nativeCoinCnt, ibcCointCnt, tokenCnt, bridgedCoinCnt, chain.cosmWasm]);

  const [currentType, setCurrentType] = useState(typeInfos[0].type);

  const currentTypeInfo = useMemo(() => typeInfos.find((item) => item.type === currentType)!, [currentType, typeInfos]);

  const { navigate } = useNavigate();

  if (nativeCoinCnt + bridgedCoinCnt + ibcCointCnt + tokenCnt < 1 && !chain.cosmWasm) {
    return null;
  }

  const isExistCoinOrToken = nativeCoinCnt + ibcCointCnt + tokenCnt > 0;

  return (
    <Container>
      <ListTitleContainer>
        <ListTitleLeftContainer>
          <TypeButton
            text={currentTypeInfo.name}
            number={currentTypeInfo.count}
            onClick={(event) => setPopoverAnchorEl(event.currentTarget)}
            isActive={isOpenPopover}
          />
        </ListTitleLeftContainer>
        <ListTitleRightContainer>
          {isExistCoinOrToken && chain.cosmWasm && (
            <AddButton type="button" onClick={() => navigate('/chain/cosmos/token/add/cw20/search')}>
              {t('pages.Wallet.components.cosmos.CoinList.index.importTokenButton')}
            </AddButton>
          )}
        </ListTitleRightContainer>
      </ListTitleContainer>
      <ListContainer>
        {(currentTypeInfo.type === 'all' || currentTypeInfo.type === 'native') &&
          sortedNativeCoins.map((item) => (
            <CoinItem
              disabled={!gt(item.availableAmount, '0')}
              key={item.baseDenom}
              onClick={() => navigate(`/wallet/send/${item.baseDenom ? `${encodeURIComponent(item.baseDenom)}` : ''}` as unknown as Path)}
              amount={item.totalAmount}
              decimals={item.decimals}
              displayDenom={item.displayDenom}
              imageURL={item.imageURL}
              coinGeckoId={item.coinGeckoId}
            />
          ))}

        {(currentTypeInfo.type === 'all' || currentTypeInfo.type === 'bridge') &&
          sortedBridgedCoins.map((item) => (
            <CoinItem
              disabled={!gt(item.availableAmount, '0')}
              key={item.baseDenom}
              onClick={() => navigate(`/wallet/send/${item.baseDenom ? `${encodeURIComponent(item.baseDenom)}` : ''}` as unknown as Path)}
              amount={item.totalAmount}
              decimals={item.decimals}
              displayDenom={item.displayDenom}
              imageURL={item.imageURL}
              coinGeckoId={item.coinGeckoId}
            />
          ))}

        {(currentTypeInfo.type === 'all' || currentTypeInfo.type === 'ibc') &&
          sortedIbcCoins.map((item) => (
            <CoinItem
              disabled={!gt(item.availableAmount, '0')}
              key={item.baseDenom}
              onClick={() => navigate(`/wallet/send/${item.baseDenom ? `${encodeURIComponent(item.baseDenom)}` : ''}` as unknown as Path)}
              amount={item.totalAmount}
              decimals={item.decimals}
              displayDenom={item.displayDenom}
              imageURL={item.imageURL}
              coinGeckoId={item.coinGeckoId}
            />
          ))}

        {(currentTypeInfo.type === 'all' || currentTypeInfo.type === 'cw20') &&
          sortedTokens.map((item) => (
            <ErrorBoundary
              key={item.id}
              FallbackComponent={
                // eslint-disable-next-line react/no-unstable-nested-components
                (props) => <TokenItemError {...props} address={address} chain={chain} token={item} onClickDelete={() => removeCosmosToken(item)} />
              }
            >
              <Suspense fallback={<TokenItemSkeleton token={item} />}>
                <TokenItem
                  address={address}
                  chain={chain}
                  token={item}
                  onClick={() => navigate(`/wallet/send/${item.address ? `${encodeURIComponent(item.address)}` : ''}` as unknown as Path)}
                  onClickDelete={() => removeCosmosToken(item)}
                />
              </Suspense>
            </ErrorBoundary>
          ))}

        {!isExistCoinOrToken && chain.cosmWasm && (
          <AddTokenButton type="button" onClick={() => navigate('/chain/cosmos/token/add/cw20/search')}>
            <Plus16Icon />
            <AddTokenTextContainer>
              <Typography variant="h6">{t('pages.Wallet.components.cosmos.CoinList.index.importTokenButton')}</Typography>
            </AddTokenTextContainer>
          </AddTokenButton>
        )}
      </ListContainer>
      <TypePopover
        marginThreshold={0}
        currentTypeInfo={currentTypeInfo}
        typeInfos={typeInfos}
        onClickType={(selectedTypeInfo) => {
          setCurrentType(selectedTypeInfo.type);
        }}
        open={isOpenPopover}
        onClose={() => setPopoverAnchorEl(null)}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      />
    </Container>
  );
}
