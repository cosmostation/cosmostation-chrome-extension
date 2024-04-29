import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { ETHEREUM, EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import IntersectionObserver from '~/Popup/components/IntersectionObserver';
import { useTokensBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokensBalanceSWR';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumToken } from '~/types/chain';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';

import TokenItem from './components/TokenItem';
import { AssetList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

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
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [viewLimit, setViewLimit] = useState(30);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const [search, setSearch] = useState('');

  const filteredTokenList = useMemo(
    () =>
      search.length > 1
        ? availableTokenList
            ?.filter((item) => item.displayDenom.toLowerCase().indexOf(search.toLowerCase()) > -1 || item.name.toLowerCase().indexOf(search.toLowerCase()) > -1)
            .slice(0, viewLimit) || []
        : availableTokenList?.slice(0, viewLimit) || [],
    [availableTokenList, viewLimit, search],
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
      </Container>
    </StyledBottomSheet>
  );
}
