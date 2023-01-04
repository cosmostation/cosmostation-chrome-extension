import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';

import CoinItem from './CoinItem';
import { CoinList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';
import type { CoinInfo } from '../../entry';

import Close24Icon from '~/images/icons/Close24.svg';

type CoinListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentSelectedCoin: CoinInfo;
  availableCoinList: CoinInfo[];
  onClickCoin?: (clickedCoin: CoinInfo) => void;
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

  const [debouncedSearch] = useDebounce(search, 500);

  const filteredCoins = debouncedSearch
    ? availableCoinList.filter(
        (item) =>
          item.chain.chainName.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1 ||
          item.displayDenom.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1,
      )
    : availableCoinList;

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
            <Typography variant="h4">{t('pages.Wallet.Swap.components.CoinListBottomSheet.index.title')}</Typography>
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
          placeholder={t('pages.Wallet.Swap.components.CoinListBottomSheet.index.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        <CoinList>
          {filteredCoins.map((item) => {
            const isActive = item.displayDenom === currentSelectedCoin.displayDenom;
            return (
              <CoinItem
                isActive={isActive}
                key={item.baseDenom}
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
