import { useEffect, useMemo, useRef, useState } from 'react';
import type { TokenData } from '@0xsquid/sdk/dist/types';
import { InputAdornment, Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { IntegratedSwapChain } from '~/types/swap/supportedChain';

import ChainItem from './components/ChainItem';
import CoinItem from './components/CoinItem';
import { AssetList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

type AssetListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  type: 'chain' | 'coin';
  currentSelectedCoin?: TokenData;
  currentSelectedChain?: IntegratedSwapChain;
  availableCoinList?: TokenData[];
  availableChainList?: IntegratedSwapChain[];
  onClickCoin?: (clickedCoin: TokenData) => void;
  onClickChain?: (clickedChain: IntegratedSwapChain) => void;
};

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

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const [search, setSearch] = useState('');

  const filteredCoinList = useMemo(
    () => (search ? availableCoinList?.filter((item) => item.symbol.toLowerCase().indexOf(search.toLowerCase()) > -1) : availableCoinList),
    [availableCoinList, search],
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
              return (
                <CoinItem
                  isActive={isActive}
                  key={item.address}
                  ref={isActive ? ref : undefined}
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
                  key={item.chainId}
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
