import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { THEME_TYPE } from '~/constants/theme';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useCurrentAptosCoins } from '~/Popup/hooks/useCurrent/useCurrentAptosCoins';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { X1CoinCoinstore } from '~/types/aptos/accounts';

import CoinItem from './components/CoinItem';
import {
  AssetList,
  Container,
  ContentContainer,
  Header,
  HeaderTitle,
  StyledBottomSheet,
  StyledButton,
  StyledCircularProgress,
  StyledInput,
  StyledSearch20Icon,
} from './styled';

import Close24Icon from '~/images/icons/Close24.svg';
import NoResultDarkIcon from '~/images/icons/NoResultDark.svg';
import NoResultLightIcon from '~/images/icons/NoResultLight.svg';

type CoinListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentCoin?: X1CoinCoinstore;
  onClickCoin?: (coin: X1CoinCoinstore) => void;
};

export default function CoinListBottomSheet({ currentCoin, onClickCoin, onClose, ...remainder }: CoinListBottomSheetProps) {
  const { extensionStorage } = useExtensionStorage();
  const { t } = useTranslation();

  const ref = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const { currentAptosCoins } = useCurrentAptosCoins();

  const [viewLimit, setViewLimit] = useState(30);
  const [search, setSearch] = useState('');
  const [debouncedSearch, { isPending, flush }] = useDebounce(search, 300);

  const filteredCoinList = useMemo(
    () =>
      debouncedSearch.length > 1
        ? currentAptosCoins.filter((item) => (item.type ? item.type.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1 : false)).slice(0, viewLimit) ||
          []
        : currentAptosCoins.slice(0, viewLimit) || [],
    [debouncedSearch, currentAptosCoins, viewLimit],
  );

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  useEffect(() => {
    if (debouncedSearch.length > 1) {
      setTimeout(() => topRef.current?.scrollIntoView(), 0);

      setViewLimit(30);
    }
  }, [debouncedSearch.length]);

  useEffect(() => {
    if (search === '') {
      flush();
    }
  }, [flush, search]);

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
            <Typography variant="h4">{t('pages.Wallet.Send.Entry.Aptos.components.CoinListBottomSheet.index.title')}</Typography>
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
          placeholder={t('pages.Wallet.Send.Entry.Aptos.components.CoinListBottomSheet.index.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />

        {isPending() ? (
          <ContentContainer>
            <StyledCircularProgress size="2.8rem" />
          </ContentContainer>
        ) : filteredCoinList.length > 0 ? (
          <AssetList>
            <div ref={topRef} />
            {filteredCoinList?.map((item) => {
              const isActive = currentCoin?.type === item.type;

              return (
                <CoinItem
                  key={item.type || 'native'}
                  coin={item}
                  isActive={isActive}
                  ref={isActive ? ref : undefined}
                  onClick={() => {
                    onClickCoin?.(item);
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
        ) : (
          <ContentContainer>
            <EmptyAsset
              Icon={extensionStorage.theme === THEME_TYPE.LIGHT ? NoResultLightIcon : NoResultDarkIcon}
              headerText={t('pages.Wallet.Send.Entry.Aptos.components.CoinListBottomSheet.index.noResultHeader')}
              subHeaderText={t('pages.Wallet.Send.Entry.Aptos.components.CoinListBottomSheet.index.noResultSubHeader')}
            />
          </ContentContainer>
        )}
      </Container>
    </StyledBottomSheet>
  );
}
