import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import OptionButton from '@/components/ChainListBottomSheet/components/OptionButton';
import Base1300Text from '@/components/common/Base1300Text';
import { ForwardRefVirtualizedList } from '@/components/common/VirtualizedList/ForwardRefVirtualizedList';
import Search from '@/components/Search';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

import {
  Body,
  ChainButtonWrapper,
  Container,
  FilterContainer,
  Header,
  HeaderTitle,
  IBCBadge,
  StyledBottomSheet,
  StyledButton,
  VirtualizedListContainer,
} from './styled';
import type { ChainBaseWithInfo } from '../RecipientChainSelectBox';

import Close24Icon from 'assets/images/icons/Close24.svg';

type ChainListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  chainList: ChainBaseWithInfo[];
  currentChainId?: UniqueChainId;
  title?: string;
  searchPlaceholder?: string;
  onClickChain: (id?: UniqueChainId) => void;
};

export default function ChainListBottomSheet({
  currentChainId,
  chainList,
  onClose,
  onClickChain,
  title,
  searchPlaceholder,
  ...remainder
}: ChainListBottomSheetProps) {
  const { t } = useTranslation();
  const bodyRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const filteredChainList = useMemo(() => {
    if (!!search && debouncedSearch.length > 1) {
      return chainList?.filter((chain) => chain.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
    }

    return chainList;
  }, [chainList, debouncedSearch, search]);

  const activeItemIndex = useMemo(
    () => filteredChainList.findIndex((item) => isMatchingUniqueChainId(item, currentChainId)),
    [currentChainId, filteredChainList],
  );

  const handleClose = () => {
    setSearch('');
    onClose?.({}, 'backdropClick');
  };

  return (
    <>
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
          <FilterContainer>
            <Search
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
              }}
              searchPlaceholder={searchPlaceholder || t('components.ChainListBottomSheet.index.searchPlaceholder')}
              disableFilter
              isPending={isDebouncing}
              onClear={() => {
                setSearch('');
                cancel();
              }}
            />
          </FilterContainer>
          <Body ref={bodyRef}>
            <ChainButtonWrapper>
              <VirtualizedListContainer>
                {!isDebouncing && filteredChainList.length > 0 && (
                  <ForwardRefVirtualizedList
                    items={filteredChainList}
                    estimateSize={() => 60}
                    renderItem={(item, virtualItem) => {
                      const isActive = isMatchingUniqueChainId(item, currentChainId);
                      return (
                        <OptionButton
                          key={getUniqueChainId(item) + virtualItem.index}
                          isActive={isActive}
                          onSelectChain={(id) => {
                            onClickChain(id);
                            handleClose();
                          }}
                          name={item.name}
                          image={item.image}
                          rightComponent={
                            item.info === 'ibc' ? (
                              <IBCBadge>
                                <Base1300Text variant="b4_M">IBC Send</Base1300Text>
                              </IBCBadge>
                            ) : undefined
                          }
                          id={getUniqueChainId(item)}
                          varient={'label'}
                        />
                      );
                    }}
                    overscan={5}
                    ref={bodyRef}
                    scrollToIndex={activeItemIndex}
                  />
                )}
              </VirtualizedListContainer>
            </ChainButtonWrapper>
          </Body>
        </Container>
      </StyledBottomSheet>
    </>
  );
}
