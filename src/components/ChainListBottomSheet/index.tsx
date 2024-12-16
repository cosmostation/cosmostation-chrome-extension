import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { InputAdornment, Typography } from '@mui/material';

import type { Chain } from '@/types/chain';

import OptionButton from './components/OptionButton';
import { Body, Container, FilterContaienr, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput } from './styled';

import SearchIcon from '@/assets/images/icons/Search18.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';

import GridMenuImage from 'assets/images/GridMenu.png';

type ChainListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  chainList: Chain[];
  currentChainId?: string;
  disableAllNetwork?: boolean;
  title?: string;
  searchPlaceholder?: string;
  onClickChain: (id: string) => void;
};

export default function ChainListBottomSheet({
  currentChainId,
  chainList,
  onClose,
  onClickChain,
  disableAllNetwork = false,
  title,
  searchPlaceholder,
  ...remainder
}: ChainListBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const AllNetworkOptionId = '';

  const filteredChainList = chainList?.filter((chain) => chain.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);

  const handleClose = () => {
    setSearch('');
    onClose?.({}, 'backdropClick');
  };

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledBottomSheet {...remainder} onClose={handleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{title || t('components.ChainListBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={handleClose}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <FilterContaienr>
          <StyledInput
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            placeholder={searchPlaceholder || t('components.ChainListBottomSheet.index.searchPlaceholder')}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
          />
        </FilterContaienr>
        <Body>
          {!disableAllNetwork && (
            <OptionButton
              key={'all-network'}
              isActive={!currentChainId}
              onClick={() => {
                onClickChain(AllNetworkOptionId);
                onClose?.({}, 'backdropClick');
              }}
              name={t('components.ChainListBottomSheet.index.allNetwork')}
              image={GridMenuImage}
              id={AllNetworkOptionId}
            />
          )}
          {filteredChainList?.map((item) => {
            const isActive = currentChainId === item.id;

            return (
              <OptionButton
                key={String(item.chainId).concat(item.chainType).concat(item.id)}
                isActive={isActive}
                ref={isActive ? ref : undefined}
                onSelectChain={(id) => {
                  onClickChain(id);
                  handleClose();
                }}
                name={item.name}
                image={item.image}
                id={item.id}
              />
            );
          })}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
