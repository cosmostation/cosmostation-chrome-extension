import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';

import type { Chain } from '@/types/chain';

import OptionButton from './components/OptionButton';
import { Body, Container, FilterContaienr, FilterIconButton, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledInput } from './styled';

import FilterSettingIcon from '@/assets/images/icons/FilterSetting20.svg';
import SearchIcon from '@/assets/images/icons/Search18.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';

import GridMenuImage from 'assets/images/GridMenu.png';

type ChainListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentChainId?: string;
  chainList?: Chain[];
  onClickChain: (id: string) => void;
};

export default function ChainListBottomSheet({ currentChainId, chainList, onClose, onClickChain, ...remainder }: ChainListBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);

  const [search, setSearch] = useState('');

  const AllNetworkOptionId = '';

  const filteredChainList = chainList?.filter((item) => {
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    if (remainder.open) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [remainder.open]);

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('components.ChainListBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
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
            placeholder={'Search'}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
          />
          <FilterIconButton
          // TODO: 필터 설정 기능 추가
          // onClick={() => {
          //   setIsOpenSortBottomSheet(true);
          // }}
          >
            <FilterSettingIcon />
          </FilterIconButton>
        </FilterContaienr>
        <Body>
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
          {filteredChainList?.map((item) => {
            const isActive = currentChainId === item.id;

            return (
              <OptionButton
                key={item.chainId}
                isActive={isActive}
                ref={isActive ? ref : undefined}
                onSelectChain={(id) => {
                  onClickChain(id);
                  onClose?.({}, 'backdropClick');
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
