import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { THEME_TYPE } from '~/constants/theme';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Token } from '~/types/ethereum/common';

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
  currentToken: Token;
  onClickCoin?: (token: Token) => void;
};

export default function CoinListBottomSheet({ currentToken, onClickCoin, onClose, ...remainder }: CoinListBottomSheetProps) {
  const { extensionStorage } = useExtensionStorage();
  const { t } = useTranslation();

  const ref = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const { currentEthereumTokens } = useCurrentEthereumTokens();

  const [viewLimit, setViewLimit] = useState(30);
  const [search, setSearch] = useState('');
  const [debouncedSearch, { isPending, flush }] = useDebounce(search, 300);

  const isPendingDebounce = isPending();
  const isSearchLoading = useMemo(() => isPendingDebounce && search.length > 1, [isPendingDebounce, search.length]);

  const tokens = useMemo(() => [null, ...currentEthereumTokens], [currentEthereumTokens]);

  const filteredTokenList = useMemo(
    () =>
      debouncedSearch.length > 1
        ? tokens
            .filter((item) =>
              [item?.displayDenom, item?.name, item?.address]
                .map((str) => str?.toLowerCase())
                .some((str) => (str ? str.indexOf(debouncedSearch.toLowerCase()) > -1 : false)),
            )
            .slice(0, viewLimit) || []
        : tokens.slice(0, viewLimit) || [],
    [debouncedSearch, tokens, viewLimit],
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
            <Typography variant="h4">{t('pages.Wallet.Send.Entry.Ethereum.components.CoinListBottomSheet.index.title')}</Typography>
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
          placeholder={t('pages.Wallet.Send.Entry.Ethereum.components.CoinListBottomSheet.index.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        {isSearchLoading ? (
          <ContentContainer>
            <StyledCircularProgress size="2.8rem" />
          </ContentContainer>
        ) : filteredTokenList.length > 0 ? (
          <AssetList>
            <div ref={topRef} />
            {filteredTokenList?.map((item) => {
              const isActive = currentToken?.id === item?.id;

              return (
                <CoinItem
                  key={item?.id || 'native'}
                  token={item}
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
            {filteredTokenList?.length > viewLimit - 1 && (
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
              headerText={t('pages.Wallet.Send.Entry.Ethereum.components.CoinListBottomSheet.index.noResultHeader')}
              subHeaderText={t('pages.Wallet.Send.Entry.Ethereum.components.CoinListBottomSheet.index.noResultSubHeader')}
            />
          </ContentContainer>
        )}
      </Container>
    </StyledBottomSheet>
  );
}
