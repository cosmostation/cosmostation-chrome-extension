import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { SUI_COIN } from '~/constants/sui';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useGetCoinsMetadataSWR } from '~/Popup/hooks/SWR/sui/useGetCoinsMetadataSWR';
import { useTokenBalanceObjectsSWR } from '~/Popup/hooks/SWR/sui/useTokenBalanceObjectsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { SuiChain } from '~/types/chain';

import CoinItem from './components/CoinItem';
import { AssetList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

type CoinListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentCoinType?: string;
  onClickCoin?: (coinType: string) => void;
  chain: SuiChain;
};

export default function CoinListBottomSheet({ currentCoinType, onClickCoin, onClose, chain, ...remainder }: CoinListBottomSheetProps) {
  const { t } = useTranslation();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const [viewLimit, setViewLimit] = useState(30);
  const [search, setSearch] = useState('');

  const ref = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts(true);

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const tokenBalanceObjects = useTokenBalanceObjectsSWR({ address });

  const coinTypes = useMemo(() => tokenBalanceObjects.tokenBalanceObjects.map((item) => item.coinType), [tokenBalanceObjects.tokenBalanceObjects]);

  const coinsMetadata = useGetCoinsMetadataSWR({ coinTypes });

  const suiAvailableCoins = useMemo(
    () =>
      tokenBalanceObjects.tokenBalanceObjects.map((item) => {
        const coinMetadata = coinsMetadata.data?.find((metadata) => metadata.id === item.coinType);

        return {
          ...item,
          decimals: coinMetadata?.result?.decimals || (item.coinType === SUI_COIN ? currentSuiNetwork.decimals : 0),
          displayDenom: coinMetadata?.result?.symbol || item.coinType,
          name: coinMetadata?.result?.name.toUpperCase(),
          imageURL: coinMetadata?.result?.iconUrl || (item.coinType === SUI_COIN ? chain.tokenImageURL : undefined),
          coinGeckoId: item.coinType === SUI_COIN ? currentSuiNetwork.coinGeckoId : '',
        };
      }),
    [chain.tokenImageURL, coinsMetadata.data, currentSuiNetwork.coinGeckoId, currentSuiNetwork.decimals, tokenBalanceObjects.tokenBalanceObjects],
  );

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const filteredCoinList = useMemo(
    () =>
      search.length > 1
        ? suiAvailableCoins.filter((item) => item.displayDenom.toLowerCase().indexOf(search.toLowerCase()) > -1).slice(0, viewLimit) || []
        : suiAvailableCoins.slice(0, viewLimit) || [],
    [search, suiAvailableCoins, viewLimit],
  );

  useEffect(() => {
    if (search.length > 1) {
      setTimeout(() => topRef.current?.scrollIntoView(), 0);

      setViewLimit(30);
    }
  }, [search.length]);

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        setSearch('');
        setViewLimit(30);

        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h4">{t('pages.Wallet.Send.Entry.Sui.components.CoinListBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              setSearch('');
              setViewLimit(30);

              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <StyledInput
          startAdornment={
            <InputAdornment position="start">
              <StyledSearch20Icon />
            </InputAdornment>
          }
          placeholder={t('pages.Wallet.Send.Entry.Sui.components.CoinListBottomSheet.index.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        <AssetList>
          <div ref={topRef} />
          {filteredCoinList?.map((item) => {
            const isActive = currentCoinType === item.coinType;

            return (
              <CoinItem
                key={item.coinType}
                coin={item}
                isActive={isActive}
                ref={isActive ? ref : undefined}
                onClick={() => {
                  onClickCoin?.(item.coinType);
                  setSearch('');
                  onClose?.({}, 'escapeKeyDown');
                }}
              />
            );
          })}
          {filteredCoinList?.length > viewLimit - 1 && (
            <IntersectionObserver
              onIntersect={() => {
                setViewLimit((limit) => limit + 30);
              }}
            />
          )}
        </AssetList>
      </Container>
    </StyledBottomSheet>
  );
}
