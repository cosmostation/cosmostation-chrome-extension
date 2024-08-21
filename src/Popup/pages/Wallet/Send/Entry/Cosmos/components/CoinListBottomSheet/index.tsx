import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { THEME_TYPE } from '~/constants/theme';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';

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
import type { CoinOrTokenInfo } from '../..';

import Close24Icon from '~/images/icons/Close24.svg';
import NoResultDarkIcon from '~/images/icons/NoResultDark.svg';
import NoResultLightIcon from '~/images/icons/NoResultLight.svg';

type CoinListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentCoinOrTokenInfo: CoinOrTokenInfo;
  coinOrTokenInfos: CoinOrTokenInfo[];
  onClickCoinOrToken?: (coinOrTokenInfo: CoinOrTokenInfo) => void;
};

export default function CoinListBottomSheet({ coinOrTokenInfos, currentCoinOrTokenInfo, onClickCoinOrToken, onClose, ...remainder }: CoinListBottomSheetProps) {
  const { extensionStorage } = useExtensionStorage();
  const { t } = useTranslation();

  const ref = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [viewLimit, setViewLimit] = useState(30);
  const [search, setSearch] = useState('');
  const [debouncedSearch, { isPending, flush }] = useDebounce(search, 300);

  const isPendingDebounce = isPending();
  const isSearchLoading = useMemo(() => isPendingDebounce && search.length > 1, [isPendingDebounce, search.length]);

  const filteredCoinOrTokenList = useMemo(
    () =>
      debouncedSearch.length > 1
        ? coinOrTokenInfos?.filter((item) => item.displayDenom.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1).slice(0, viewLimit) || []
        : coinOrTokenInfos?.slice(0, viewLimit) || [],
    [coinOrTokenInfos, viewLimit, debouncedSearch],
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

        {isSearchLoading ? (
          <ContentContainer>
            <StyledCircularProgress size="2.8rem" />
          </ContentContainer>
        ) : filteredCoinOrTokenList.length > 0 ? (
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
        ) : (
          <ContentContainer>
            <EmptyAsset
              Icon={extensionStorage.theme === THEME_TYPE.LIGHT ? NoResultLightIcon : NoResultDarkIcon}
              headerText={t('pages.Wallet.Send.Entry.Cosmos.components.CoinListBottomSheet.index.noResultHeader')}
              subHeaderText={t('pages.Wallet.Send.Entry.Cosmos.components.CoinListBottomSheet.index.noResultSubHeader')}
            />
          </ContentContainer>
        )}
      </Container>
    </StyledBottomSheet>
  );
}
