import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import IconTextButton from '@/components/common/IconTextButton';
import Search from '@/components/Search';
import { useChainList } from '@/hooks/useChainList';
import { Route as AddAddress } from '@/pages/general-setting/address-book/add-address';
import type { UniqueChainId } from '@/types/chain';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';

import AddressItemButton from './-components/AddressItemButton';
import { AddressItemWrapper, AddTextContainer, Container, PurpleContainer, RowContainer, StickyContainer } from './-styled';

import PlusIcon from '@/assets/images/icons/Plus12.svg';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { flatChainList } = useChainList();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();

  const dummyAddressList = [
    {
      id: '471c6230-bc54-47d2-aa9d-61e7c3ab0ba3',
      label: 'test',
      address: 'cosmos1p3ucd3ptpw902fluyjzhq3ffgq4ntddac9sa3s',
      chainId: 'cosmos-cosmos',
      memo: 'test Memo',
    },

    {
      id: '914f2218-ccdf-4e45-9501-9e96def4c2dc',
      label: 'test',
      address: 'cosmos1p3ucd3ptpw902fluyjzhq3ffgq4ntddac9sa3s',
      chainId: 'cosmos-cosmos',
      memo: 'ENS',
    },
    {
      id: '0c182fbc-1101-45aa-a4f5-76ba046b9265',
      label: 'test',
      address: 'cosmos1p3ucd3ptpw902fluyjzhq3ffgq4ntddac9sa3s',
      chainId: 'cosmos-cosmos',
      memo: 'dm,ajfklsadnknsdakfnfjsadknjdnbjafsjknjkdsjkfksksdahufhhdsjkfhjkashdjfkasjkbjksbdajbasbsjkadsjafakh',
    },
  ];

  const filteredAddressesWithChain = (() => {
    return currentSelectedChainId ? dummyAddressList.filter((item) => item.chainId === currentSelectedChainId) || [] : dummyAddressList || [];
  })();

  const filteredAddresses = (() => {
    if (!!search && debouncedSearch.length > 1) {
      return (
        filteredAddressesWithChain.filter((address) => {
          const condition = [address.address, address.label];

          return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
        }) || []
      );
    }
    return filteredAddressesWithChain;
  })();

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <StickyContainer>
            <Search
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
              }}
              isPending={isDebouncing}
              disableFilter
              onClear={() => {
                setSearch('');
                cancel();
              }}
            />

            <RowContainer>
              <AllNetworkButton
                sizeVariant="medium"
                typoVarient="b2_M"
                currentChainId={currentSelectedChainId}
                chainList={flatChainList}
                selectChainOption={(id) => {
                  setCurrentSelectedChainId(id);
                }}
              />

              <IconTextButton
                onClick={() => {
                  navigate({
                    to: AddAddress.to,
                  });
                }}
                leadingIcon={
                  <PurpleContainer>
                    <PlusIcon />
                  </PurpleContainer>
                }
              >
                <AddTextContainer>
                  <Typography variant="b3_M">{t('pages.general-setting.address-book.entry.addAddress')}</Typography>
                </AddTextContainer>
              </IconTextButton>
            </RowContainer>
          </StickyContainer>
          <AddressItemWrapper>
            {!isDebouncing &&
              filteredAddresses.map((item) => {
                const chain = flatChainList.find((chain) => isMatchingUniqueChainId(chain, item.chainId));

                return (
                  <AddressItemButton
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    address={item.address}
                    memo={item.memo}
                    chainName={chain?.name || 'Unknown'}
                    chainImage={chain?.image || ''}
                  />
                );
              })}
          </AddressItemWrapper>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
