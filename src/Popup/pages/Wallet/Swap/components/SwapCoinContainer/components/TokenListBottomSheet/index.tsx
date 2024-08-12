import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import { ETHEREUM, EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import { THEME_TYPE } from '~/constants/theme';
import EmptyAsset from '~/Popup/components/EmptyAsset';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useTokensBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokensBalanceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumToken } from '~/types/chain';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';

import TokenItem from './components/TokenItem';
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

type TokenListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  availableTokenList?: IntegratedSwapToken[];
  currentSelectedChain?: IntegratedSwapChain;
  currentSelectedToken?: IntegratedSwapToken;
  onClickToken: (clickedToken: IntegratedSwapToken) => void;
};

export default function TokenListBottomSheet({
  currentSelectedChain,
  currentSelectedToken,
  availableTokenList,
  onClickToken,
  onClose,
  ...remainder
}: TokenListBottomSheetProps) {
  const { extensionStorage } = useExtensionStorage();

  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [viewLimit, setViewLimit] = useState(30);

  const [search, setSearch] = useState('');

  const [debouncedSearch, { isPending, flush }] = useDebounce(search, 300);

  const filteredTokenList = useMemo(
    () =>
      debouncedSearch.length > 1
        ? availableTokenList
            ?.filter((item) =>
              [item.displayDenom, item.name, item.tokenAddressOrDenom]
                .map((str) => str.toLowerCase())
                .some((str) => str.indexOf(debouncedSearch.toLowerCase()) > -1),
            )
            .slice(0, viewLimit) || []
        : availableTokenList?.slice(0, viewLimit) || [],
    [availableTokenList, viewLimit, debouncedSearch],
  );

  const { data: tokensBalance } = useTokensBalanceSWR({
    network: currentSelectedChain?.line === ETHEREUM.line ? currentSelectedChain : undefined,
    tokens: filteredTokenList as Omit<EthereumToken, 'id' | 'ethereumNetworkId' | 'tokenType'>[],
  });

  const sortedTokenList = useMemo(() => {
    const relocatedTokenList = filteredTokenList.map((item) => {
      const tokenBalanceData = tokensBalance?.find(
        (tokenBalance) => tokenBalance.status === 'fulfilled' && isEqualsIgnoringCase(tokenBalance.value.id, item.tokenAddressOrDenom),
      );

      return {
        ...item,
        balance: item.balance || (tokenBalanceData?.status === 'fulfilled' && gt(tokenBalanceData.value.balance, '0') ? tokenBalanceData.value.balance : '0'),
      };
    });

    const sortedListByChainLine =
      currentSelectedChain?.line === 'COSMOS'
        ? relocatedTokenList
        : [...relocatedTokenList.filter((item) => gt(item.balance, '0')), ...relocatedTokenList.filter((item) => !gt(item.balance, '0'))].sort((a) =>
            isEqualsIgnoringCase(EVM_NATIVE_TOKEN_ADDRESS, a.tokenAddressOrDenom) ? -1 : 1,
          );

    return sortedListByChainLine;
  }, [currentSelectedChain?.line, filteredTokenList, tokensBalance]);

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
            <Typography variant="h4">
              {t('pages.Wallet.Swap.components.SwapCoinContainer.components.TokenListBottomSheet.index.tokenBottomListTitle')}
            </Typography>
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
          placeholder={t('pages.Wallet.Swap.components.SwapCoinContainer.components.TokenListBottomSheet.index.searchTokenPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        {isPending() && search !== '' ? (
          <ContentContainer>
            <StyledCircularProgress size="2.8rem" />
          </ContentContainer>
        ) : sortedTokenList?.length > 0 ? (
          <AssetList>
            <div ref={topRef} />
            {sortedTokenList?.map((item) => {
              const isActive = isEqualsIgnoringCase(item.tokenAddressOrDenom, currentSelectedToken?.tokenAddressOrDenom);
              return (
                <TokenItem
                  isActive={isActive}
                  key={item.tokenAddressOrDenom}
                  ref={isActive ? ref : undefined}
                  tokenInfo={item}
                  onClickToken={(clickedToken) => {
                    onClickToken(clickedToken);
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
              headerText={t('pages.Wallet.Swap.components.SwapCoinContainer.components.TokenListBottomSheet.index.noResultHeader')}
              subHeaderText={t('pages.Wallet.Swap.components.SwapCoinContainer.components.TokenListBottomSheet.index.noResultSubHeader')}
            />
          </ContentContainer>
        )}
      </Container>
    </StyledBottomSheet>
  );
}
