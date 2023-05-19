import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';

import CoinItem from './CoinItem';
import { CoinList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';
import type { ChainAssetInfo } from '../../entry';

import Close24Icon from '~/images/icons/Close24.svg';

type CoinListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentSelectedCoin?: ChainAssetInfo;
  availableCoinList: ChainAssetInfo[];
  onClickCoin?: (clickedCoin: ChainAssetInfo) => void;
};

export default function CoinListBottomSheet({ currentSelectedCoin, availableCoinList, onClickCoin, onClose, ...remainder }: CoinListBottomSheetProps) {
  const { t } = useTranslation();

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const [search, setSearch] = useState('');

  const filteredCoinList = useMemo(
    () =>
      search
        ? availableCoinList.filter(
            (item) => item.chainName.toLowerCase().indexOf(search.toLowerCase()) > -1 || item.symbol.toLowerCase().indexOf(search.toLowerCase()) > -1,
          )
        : availableCoinList,
    [availableCoinList, search],
  );

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
            <Typography variant="h4">{t('pages.Wallet.OsmosisSwap.components.CoinListBottomSheet.index.title')}</Typography>
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
          placeholder={t('pages.Wallet.OsmosisSwap.components.CoinListBottomSheet.index.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        <CoinList>
          {filteredCoinList.map((item) => {
            const isActive = item.symbol === currentSelectedCoin?.symbol;
            return (
              <CoinItem
                isActive={isActive}
                key={item.denom}
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
        </CoinList>
      </Container>
    </StyledBottomSheet>
  );
}
