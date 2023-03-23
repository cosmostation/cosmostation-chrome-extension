import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
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

  const [chainMax, setchainMax] = useState(30);
  const ref = useRef<HTMLButtonElement>(null);
  const scrollObserver = useRef<HTMLDivElement>(null);

  const onIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    const target = entries[0];
    if (target.isIntersecting) {
      observer.unobserve(target.target);
      setchainMax((chainMaxVal) => chainMaxVal + 30);
      observer.observe(target.target);
    }
  };

  useEffect(() => {
    if (!scrollObserver?.current) return;

    const io = new IntersectionObserver(onIntersect, { threshold: 0.1 });
    io.observe(scrollObserver?.current);

    // eslint-disable-next-line consistent-return
    return () => {
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollObserver]);

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
        : availableTokenList?.slice(0, chainMax),
    [availableTokenList, chainMax, search],
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
            <Typography variant="h4">
              {t('pages.Wallet.Swap.components.SwapCoinContainer.components.TokenListBottomSheet.index.tokenBottomListTitle')}
            </Typography>
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
          placeholder={t('pages.Wallet.Swap.components.SwapCoinContainer.components.TokenListBottomSheet.index.searchTokenPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        <AssetList>
          {filteredTokenList?.map((item) => {
            const isActive = item.symbol === currentSelectedToken?.symbol;
            return (
              <TokenItem
                isActive={isActive}
                key={item.address || item.denom}
                ref={isActive ? ref : undefined}
                currentNetwork={currentSelectedChain?.line === 'ETHEREUM' ? currentSelectedChain : undefined}
                tokenInfo={item}
                onClickToken={(clickedToken) => {
                  onClickToken?.(clickedToken);
                  setSearch('');
                  onClose?.({}, 'escapeKeyDown');
                }}
              />
            );
          })}
          <Div ref={scrollObserver} />
        </AssetList>
      </Container>
    </StyledBottomSheet>
  );
}
