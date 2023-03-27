import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { useIntersectionObserver } from '~/Popup/hooks/useIntersectionObserver';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';

import TokenItem from './components/TokenItem';
import { AssetList, Container, Div, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

type TokenListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentSelectedChain?: IntegratedSwapChain;
  currentSelectedToken?: IntegratedSwapToken;
  availableTokenList?: IntegratedSwapToken[];
  onClickToken?: (clickedToken: IntegratedSwapToken) => void;
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
  const [visibleChainVal, setVisibleChainVal] = useState(30);

  const onIntersect: IntersectionObserverCallback = ([{ isIntersecting }]) => {
    if (isIntersecting) {
      setVisibleChainVal((visibleChainValVal) => visibleChainValVal + 30);
    }
  };

  const { setIntersectionObserver } = useIntersectionObserver(onIntersect, 0.3);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const [search, setSearch] = useState('');

  const filteredTokenList = useMemo(
    () =>
      search.length > 1
        ? availableTokenList?.filter(
            (item) => item.symbol.toLowerCase().indexOf(search.toLowerCase()) > -1 || item.name.toLowerCase().indexOf(search.toLowerCase()) > -1,
          )
        : availableTokenList?.slice(0, visibleChainVal),
    [availableTokenList, visibleChainVal, search],
  );

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        setSearch('');
        setVisibleChainVal(30);

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
              setVisibleChainVal(30);

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
          {filteredTokenList?.map((item) => {
            const isActive = isEqualsIgnoringCase(item.address, currentSelectedToken?.address);
            return (
              <TokenItem
                isActive={isActive}
                key={item.address}
                ref={isActive ? ref : undefined}
                currentNetwork={currentSelectedChain?.line === 'ETHEREUM' ? currentSelectedChain : undefined}
                tokenInfo={item}
                onClickToken={(clickedToken) => {
                  onClickToken?.(clickedToken);
                  setSearch('');
                  setVisibleChainVal(30);

                  onClose?.({}, 'escapeKeyDown');
                }}
              />
            );
          })}
          <Div ref={setIntersectionObserver} />
        </AssetList>
      </Container>
    </StyledBottomSheet>
  );
}
