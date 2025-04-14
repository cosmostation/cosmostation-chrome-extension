import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import IconTextButton from '@/components/common/IconTextButton';
import EmptyAsset from '@/components/EmptyAsset';
import Search from '@/components/Search';
import { useAddressBook } from '@/hooks/useAddressBook';
import { useChainList } from '@/hooks/useChainList';
import { Route as AddAddress } from '@/pages/general-setting/address-book/add-address';
import { Route as EditAddress } from '@/pages/general-setting/address-book/edit-address/$id';
import type { ChainType, UniqueChainId } from '@/types/chain';
import { filterChainsByChainId } from '@/utils/asset';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';

import AddressItemButton from './-components/AddressItemButton';
import {
  AddressItemWrapper,
  AddTextContainer,
  Container,
  ContentsContainer,
  EmptyAssetContainer,
  PurpleContainer,
  RowContainer,
  StickyContainer,
} from './-styled';
import { UNIVERSAL_EVM_NETWORK_ID } from './add-address/-entry';

import NoListIcon from '@/assets/images/icons/NoList70.svg';
import PlusIcon from '@/assets/images/icons/Plus12.svg';

import EVMImage from '@/assets/images/chain/evm.png';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { addressBookList } = useAddressBook();

  const { flatChainList } = useChainList();

  const filteredUniqueChains = [
    {
      id: UNIVERSAL_EVM_NETWORK_ID,
      name: 'EVM Network',
      image: EVMImage,
      chainType: 'evm' as ChainType,
    },
    ...filterChainsByChainId(flatChainList),
  ];

  const baseChainList = [
    {
      id: UNIVERSAL_EVM_NETWORK_ID,
      name: 'EVM Network',
      image: EVMImage,
      chainType: 'evm' as ChainType,
    },
    ...flatChainList,
  ];

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();

  const filteredAddressesWithChain = (() => {
    return currentSelectedChainId
      ? addressBookList.filter((item) => parseUniqueChainId(item.chainId).id === parseUniqueChainId(currentSelectedChainId).id) || []
      : addressBookList || [];
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
      <EdgeAligner
        style={{
          flex: '1',
        }}
      >
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
                currentChainId={currentSelectedChainId}
                chainList={filteredUniqueChains}
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
          <ContentsContainer>
            {!isDebouncing &&
              (filteredAddresses.length > 0 ? (
                <AddressItemWrapper>
                  {!isDebouncing &&
                    filteredAddresses.map((item) => {
                      const chain = baseChainList.find((chain) => isMatchingUniqueChainId(chain, item.chainId));

                      const chainName = chain?.id === UNIVERSAL_EVM_NETWORK_ID ? `${chain.name} (Universal)` : chain?.name || 'Unknown';
                      return (
                        <AddressItemButton
                          key={item.id}
                          id={item.id}
                          label={item.label}
                          address={item.address}
                          memo={item.memo}
                          chainName={chainName}
                          chainImage={chain?.image || ''}
                          onClick={() => {
                            navigate({
                              to: EditAddress.to,
                              params: {
                                id: item.id,
                              },
                            });
                          }}
                        />
                      );
                    })}
                </AddressItemWrapper>
              ) : (
                <EmptyAssetContainer>
                  <EmptyAsset
                    icon={<NoListIcon />}
                    title={t('pages.general-setting.address-book.entry.noList')}
                    subTitle={t('pages.general-setting.address-book.entry.noListSubtitle')}
                  />
                </EmptyAssetContainer>
              ))}
          </ContentsContainer>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
