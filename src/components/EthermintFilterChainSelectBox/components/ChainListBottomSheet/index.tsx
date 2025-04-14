import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import Search from '@/components/Search';
import { Route as SwitchAccountType } from '@/pages/manage-assets/switch-accout-type';
import { Route as ManageCustomNetwork } from '@/pages/manage-assets/visibility/network';
import type { ChainBase, UniqueChainId } from '@/types/chain';
import { getUniqueChainId } from '@/utils/queryParamGenerator';

import OptionButton from './components/OptionButton';
import {
  Body,
  Container,
  CustomNetworkButton,
  CustomNetworkTextContaienr,
  FilterContaienr,
  Header,
  HeaderTitle,
  ManageAssetsContaienr,
  NetworkCounts,
  NetworkInfoContainer,
  StyledBottomSheet,
  StyledButton,
  SwtichCoinType,
} from './styled';

import ChangeIcon from 'assets/images/icons/Change14.svg';
import Close24Icon from 'assets/images/icons/Close24.svg';
import CustomNetworkIcon from 'assets/images/icons/CustomNetwork28.svg';

import AllNetworkImage from 'assets/images/network.png';

type ChainListBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  chainList: ChainBase[];
  currentChain?: ChainBase;
  disableAllNetwork?: boolean;
  disableSort?: boolean;
  title?: string;
  searchPlaceholder?: string;
  customType?: 'normal' | 'manageAssets';
  onClickChain: (id?: UniqueChainId) => void;
};

export default function ChainListBottomSheet({
  currentChain,
  chainList,
  onClose,
  onClickChain,
  disableAllNetwork = false,
  disableSort = false,
  title,
  searchPlaceholder,
  customType = 'normal',
  ...remainder
}: ChainListBottomSheetProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const AllNetworkOptionId = undefined;

  const sortedChainList = useMemo(
    () =>
      disableSort
        ? chainList
        : chainList?.sort((a, b) => {
            return a.name.localeCompare(b.name);
          }),
    [chainList, disableSort],
  );

  const filteredChainList = useMemo(() => {
    if (!!search && debouncedSearch.length > 1) {
      return sortedChainList?.filter((chain) => chain.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
    }
    return sortedChainList;
  }, [debouncedSearch, search, sortedChainList]);

  const chainsCount = String(chainList.length);

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
          <Search
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
            disableFilter
            searchPlaceholder={searchPlaceholder || t('components.ChainListBottomSheet.index.searchPlaceholder')}
            isPending={isDebouncing}
            onClear={() => {
              setSearch('');
              cancel();
            }}
          />
        </FilterContaienr>
        {customType === 'manageAssets' && (
          <ManageAssetsContaienr>
            <CustomNetworkButton
              onClick={() => {
                navigate({
                  to: ManageCustomNetwork.to,
                });
              }}
              leftContent={<CustomNetworkIcon />}
              leftSecondBody={
                <CustomNetworkTextContaienr>
                  <Base1300Text variant="b3_M_Multiline">{t('components.ChainListBottomSheet.index.customNetwork')}</Base1300Text>
                </CustomNetworkTextContaienr>
              }
            />
            <NetworkInfoContainer>
              <Base1300Text variant="b3_M">
                {t('components.ChainListBottomSheet.index.network')}
                &nbsp;
                <NetworkCounts>{chainsCount}</NetworkCounts>
              </Base1300Text>

              <IconTextButton
                onClick={() => {
                  navigate({
                    to: SwitchAccountType.to,
                  });
                }}
                leadingIcon={<ChangeIcon />}
              >
                <SwtichCoinType>
                  <Typography variant="b3_M">{t('components.ChainListBottomSheet.index.switchCoinType')}</Typography>
                </SwtichCoinType>
              </IconTextButton>
            </NetworkInfoContainer>
          </ManageAssetsContaienr>
        )}
        <Body>
          {!disableAllNetwork && !isDebouncing && (
            <OptionButton
              key={'all-network'}
              isActive={!currentChain}
              onSelectChain={(id) => {
                onClickChain(id);
              }}
              name={t('components.ChainListBottomSheet.index.allNetwork')}
              image={AllNetworkImage}
              id={AllNetworkOptionId}
            />
          )}
          {!isDebouncing &&
            filteredChainList?.length > 0 &&
            filteredChainList?.map((item) => {
              const isActive = currentChain && currentChain.id === item.id;

              return (
                <OptionButton
                  key={getUniqueChainId(item)}
                  isActive={isActive}
                  ref={isActive ? ref : undefined}
                  onSelectChain={(id) => {
                    onClickChain(id);
                  }}
                  name={item.name}
                  image={item.image}
                  id={getUniqueChainId(item)}
                />
              );
            })}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
