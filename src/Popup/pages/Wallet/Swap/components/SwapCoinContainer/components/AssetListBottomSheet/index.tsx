import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { IntegratedSwapChain } from '~/types/swap/supportedChain';
import type { IntegratedSwapToken } from '~/types/swap/supportedToken';

import ChainItem from './components/ChainItem';
import CoinItem from './components/CoinItem';
import { AssetList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

type AssetListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  type: 'chain' | 'coin';
  currentSelectedCoin?: IntegratedSwapToken;
  currentSelectedChain?: IntegratedSwapChain;
  availableCoinList?: IntegratedSwapToken[];
  availableChainList?: IntegratedSwapChain[];
  onClickCoin?: (clickedCoin: IntegratedSwapToken) => void;
  onClickChain?: (clickedChain: IntegratedSwapChain) => void;
};

// NOTE coin 컴포넌트로직이 복잡해짐에 따라 체인, 코인 바텀시트로 컴포넌트 분리할 것
export default function AssetListBottomSheet({
  type,
  currentSelectedCoin,
  currentSelectedChain,
  availableCoinList,
  availableChainList,
  onClickCoin,
  onClickChain,
  onClose,
  ...remainder
}: AssetListBottomSheetProps) {
  const { t } = useTranslation();
  const { chromeStorage } = useChromeStorage();

  const { ethereumTokens } = chromeStorage;

  const currentEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentSelectedChain?.id);

  const currentEthereumTokenAddresses = currentEthereumTokens.map((item) => item.address);

  const ref = useRef<HTMLButtonElement>(null);
  // 토큰 처음에는 30개만 노출하고 검색 2자 이상일 때부터 필터링
  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const [search, setSearch] = useState('');

  const sortedCoinList = useMemo(
    () =>
      availableCoinList
        ? [
            ...availableCoinList
              // NOTE 추후에 지원할 토큰리스트를 chainList에 업로드 할 것
              .filter((item) => currentEthereumTokenAddresses.includes(item.address))
              .map((item) => ({
                ...item,
                coingeckoId: currentEthereumTokens.find((token) => token.address === item.address)?.coinGeckoId || '',
              })),
            ...availableCoinList.filter((item) => !currentEthereumTokenAddresses.includes(item.address)),
          ]
        : [],
    [currentEthereumTokenAddresses, currentEthereumTokens, availableCoinList],
  );

  const filteredCoinList = useMemo(
    () => (search ? sortedCoinList?.filter((item) => item.symbol.toLowerCase().indexOf(search.toLowerCase()) > -1) : sortedCoinList),
    [sortedCoinList, search],
  );

  const filteredChainList = useMemo(
    () => (search ? availableChainList?.filter((item) => item.networkName.toLowerCase().indexOf(search.toLowerCase()) > -1) : availableChainList),
    [availableChainList, search],
  );

  const bottomListTitle = useMemo(() => {
    if (type === 'chain') {
      return t('pages.Wallet.Swap.components.SwapCoinContainer.components.AssetListBottomSheet.index.chainBottomListTitle');
    }
    return t('pages.Wallet.Swap.components.SwapCoinContainer.components.AssetListBottomSheet.index.coinBottomListTitle');
  }, [t, type]);

  const searchPlaceholder = useMemo(() => {
    if (type === 'chain') {
      return t('pages.Wallet.Swap.components.SwapCoinContainer.components.AssetListBottomSheet.index.searchChainPlaceholder');
    }
    return t('pages.Wallet.Swap.components.SwapCoinContainer.components.AssetListBottomSheet.index.searchCoinPlaceholder');
  }, [t, type]);

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        setSearch('');
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h4">{bottomListTitle}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              setSearch('');
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
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        <AssetList>
          {type === 'coin' &&
            filteredCoinList?.map((item) => {
              const isActive = item.symbol === currentSelectedCoin?.symbol;
              const isAdded = currentEthereumTokenAddresses.includes(item.address);
              return (
                <CoinItem
                  isActive={isActive}
                  key={item.address}
                  ref={isActive ? ref : undefined}
                  currentNetwork={isAdded ? currentSelectedChain : undefined}
                  coinInfo={item}
                  onClickCoin={(clickedCoin) => {
                    onClickCoin?.(clickedCoin);
                    setSearch('');
                    onClose?.({}, 'escapeKeyDown');
                  }}
                />
              );
            })}
          {type === 'chain' &&
            filteredChainList?.map((item) => {
              const isActive = item.chainId === currentSelectedChain?.chainId;
              return (
                <ChainItem
                  isActive={isActive}
                  key={item.id}
                  ref={isActive ? ref : undefined}
                  chainInfo={item}
                  onClickChain={(clickedChain) => {
                    onClickChain?.(clickedChain);
                    setSearch('');
                    onClose?.({}, 'escapeKeyDown');
                  }}
                />
              );
            })}
        </AssetList>
      </Container>
    </StyledBottomSheet>
  );
}
