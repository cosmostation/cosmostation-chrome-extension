import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';

import TokenItem from './components/TokenItem';
import { AssetList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';

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
        : availableTokenList?.slice(0, 30),
    [availableTokenList, search],
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
        </AssetList>
      </Container>
    </StyledBottomSheet>
  );
}
