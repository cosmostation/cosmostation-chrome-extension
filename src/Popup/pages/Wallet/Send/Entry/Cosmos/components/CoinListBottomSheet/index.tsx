import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';

import CoinItem from './components/CoinItem';
import { AssetList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';
import type { CoinOrTokenInfo } from '../..';

import Close24Icon from '~/images/icons/Close24.svg';

type CoinListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentCoinOrTokenInfo: CoinOrTokenInfo;
  coinOrTokenInfos: CoinOrTokenInfo[];
  onClickCoinOrToken?: (coinOrTokenInfo: CoinOrTokenInfo) => void;
};

export default function CoinListBottomSheet({ coinOrTokenInfos, currentCoinOrTokenInfo, onClickCoinOrToken, onClose, ...remainder }: CoinListBottomSheetProps) {
  const { t } = useTranslation();

  const ref = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [viewLimit, setViewLimit] = useState(30);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const filteredCoinOrTokenList = useMemo(
    () =>
      search.length > 1
        ? coinOrTokenInfos?.filter((item) => item.displayDenom.toLowerCase().indexOf(search.toLowerCase()) > -1).slice(0, viewLimit) || []
        : coinOrTokenInfos?.slice(0, viewLimit) || [],
    [coinOrTokenInfos, viewLimit, search],
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
            <Typography variant="h4">{t('pages.Wallet.Send.Entry.Cosmos.components.CoinListBottomSheet.index.title')}</Typography>
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
          placeholder={t('pages.Wallet.Send.Entry.Cosmos.components.CoinListBottomSheet.index.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        <AssetList>
          <div ref={topRef} />
          {filteredCoinOrTokenList?.map((item) => {
            const isActive =
              currentCoinOrTokenInfo.type === 'coin' && item.type === 'coin'
                ? isEqualsIgnoringCase(item.baseDenom, currentCoinOrTokenInfo.baseDenom)
                : currentCoinOrTokenInfo.type === 'token' && item.type === 'token'
                ? isEqualsIgnoringCase(item.address, currentCoinOrTokenInfo.address)
                : false;
            return (
              <CoinItem
                isActive={isActive}
                key={item.type === 'coin' ? item.baseDenom : item.address}
                ref={isActive ? ref : undefined}
                coinInfo={item}
                onClickCoin={(clickedCoin) => {
                  onClickCoinOrToken?.(clickedCoin);
                  setSearch('');

                  onClose?.({}, 'escapeKeyDown');
                }}
              />
            );
          })}
          {filteredCoinOrTokenList?.length > viewLimit - 1 && (
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
