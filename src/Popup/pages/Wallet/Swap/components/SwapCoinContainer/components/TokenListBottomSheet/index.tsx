import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { IntegratedSwapChain } from '~/types/swap/supportedChain';
import type { IntegratedSwapToken } from '~/types/swap/supportedToken';

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
  const { chromeStorage } = useChromeStorage();

  const { ethereumTokens } = chromeStorage;

  const currentEthereumTokens = ethereumTokens.filter((item) => item.ethereumNetworkId === currentSelectedChain?.id);

  const currentEthereumTokenAddresses = currentEthereumTokens.map((item) => item.address);

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const [search, setSearch] = useState('');

  const sortedTokenList = useMemo(
    () =>
      availableTokenList
        ? [
            ...availableTokenList
              // NOTE 추후에 지원할 토큰리스트를 chainList에 업로드 할 것
              .filter((item) => currentEthereumTokenAddresses.includes(item.address))
              .map((item) => ({
                ...item,
                coingeckoId: currentEthereumTokens.find((token) => token.address === item.address)?.coinGeckoId || '',
              })),
            ...availableTokenList.filter((item) => !currentEthereumTokenAddresses.includes(item.address)),
          ]
        : [],
    [currentEthereumTokenAddresses, currentEthereumTokens, availableTokenList],
  );

  const filteredTokenList = useMemo(
    () => (search ? sortedTokenList?.filter((item) => item.symbol.toLowerCase().indexOf(search.toLowerCase()) > -1) : sortedTokenList),
    [sortedTokenList, search],
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
            const isAdded = currentEthereumTokenAddresses.includes(item.address);
            return (
              <TokenItem
                isActive={isActive}
                key={item.address}
                ref={isActive ? ref : undefined}
                currentNetwork={isAdded ? currentSelectedChain : undefined}
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
