import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Token } from '~/types/ethereum/common';

import CoinItem from './components/CoinItem';
import { AssetList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

type CoinListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentToken: Token;
  onClickCoin?: (token: Token) => void;
};

export default function CoinListBottomSheet({ currentToken, onClickCoin, onClose, ...remainder }: CoinListBottomSheetProps) {
  const { t } = useTranslation();

  const ref = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const { currentEthereumTokens } = useCurrentEthereumTokens();

  const [viewLimit, setViewLimit] = useState(30);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const tokens = useMemo(() => [null, ...currentEthereumTokens], [currentEthereumTokens]);

  const filteredTokenList = useMemo(
    () =>
      search.length > 1
        ? tokens.filter((item) => (item?.displayDenom ? item?.displayDenom.toLowerCase().indexOf(search.toLowerCase()) > -1 : false)).slice(0, viewLimit) || []
        : tokens.slice(0, viewLimit) || [],
    [search, tokens, viewLimit],
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
      </Container>
    </StyledBottomSheet>
  );
}
