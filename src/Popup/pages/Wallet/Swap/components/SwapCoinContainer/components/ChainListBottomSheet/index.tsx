import { useEffect, useMemo, useRef, useState } from 'react';
import { InputAdornment, Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { IntegratedSwapChain } from '~/types/swap/asset';

import ChainItem from './components/ChainItem';
import { AssetList, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput, StyledSearch20Icon } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

type ChainListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  availableChainList?: IntegratedSwapChain[];
  currentSelectedChain?: IntegratedSwapChain;
  onClickChain: (clickedChain: IntegratedSwapChain) => void;
};

export default function ChainListBottomSheet({ currentSelectedChain, availableChainList, onClickChain, onClose, ...remainder }: ChainListBottomSheetProps) {
  const { t } = useTranslation();

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  const [search, setSearch] = useState('');

  const filteredChainList = useMemo(
    () => (search ? availableChainList?.filter((item) => item.networkName.toLowerCase().indexOf(search.toLowerCase()) > -1) : availableChainList),
    [availableChainList, search],
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
              {t('pages.Wallet.Swap.components.SwapCoinContainer.components.ChainListBottomSheet.index.chainBottomListTitle')}
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
          placeholder={t('pages.Wallet.Swap.components.SwapCoinContainer.components.ChainListBottomSheet.index.searchChainPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
        />
        <AssetList>
          {filteredChainList?.map((item) => {
            const isActive = item.id === currentSelectedChain?.id;
            return (
              <ChainItem
                isActive={isActive}
                key={item.id}
                ref={isActive ? ref : undefined}
                chainInfo={item}
                onClickChain={(clickedChain) => {
                  onClickChain(clickedChain);
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
