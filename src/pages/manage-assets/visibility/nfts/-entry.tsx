import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import AllNetworkButton from '@/components/AllNetworkButton';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import DeleteConfirmBottomSheet from '@/components/DeleteConfirmBottomSheet';
import Search from '@/components/Search';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { useCurrentAddedEVMNFTsWithMetaData } from '@/hooks/evm/nft/useCurrentAddedEVMNFTsWithMetaData';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccountAddibleNFTs } from '@/hooks/useCurrentAccountAddibleNFTs';
import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';
import { Route as ImportNFT } from '@/pages/manage-assets/import/nft';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';

import NFTButtonItem from './-components/NFTButtonItem';
import {
  ButtonWrapper,
  Container,
  DeleteNFTContainer,
  DeleteNFTImage,
  DeleteNFTImageContainer,
  ImportTextContainer,
  PurpleContainer,
  RowContainer,
  StickyContainer,
} from './-styled';

import PlusIcon from '@/assets/images/icons/Plus12.svg';

type SuiNFTItem = {
  id?: string;
  accountId: string;
  chainId: string;
  chainType: 'sui';
  ownerAddress: string;
  name: string;
  subName: string;
  image: string;
  objectId: string;
  type: string;
};

type EVMNFTItem = {
  id?: string;
  accountId: string;
  chainId: string;
  chainType: 'evm';
  ownerAddress: string;
  name: string;
  subName: string;
  image: string;
  tokenId: string;
  contractAddress: string;
  tokenType: string;
  isCustom: boolean;
};

type CosmosNFTItem = {
  id?: string;
  accountId: string;
  chainId: string;
  chainType: 'cosmos';
  ownerAddress: string;
  name: string;
  subName: string;
  image: string;
  tokenId: string;
  contractAddress: string;
  tokenType: string;
};

type NFTItem = SuiNFTItem | EVMNFTItem | CosmosNFTItem;

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { scrollToTop } = useScroll();

  const { chainList } = useChainList();

  const [suppoesdDeleteNFTItem, setSupposedDeleteItem] = useState<NFTItem | undefined>();

  const [initSortKeys, setInitSortKeys] = useState<string[] | undefined>(undefined);

  const [viewLimit, setViewLimit] = useState(30);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const isDebouncing = !!search && isPending();

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();

  const baseChainList = useMemo(() => {
    const cosmosChains = chainList.cosmosChains?.filter((item) => item.isCosmwasm) || [];

    return [...cosmosChains, ...(chainList.evmChains || []), ...(chainList.suiChains || [])];
  }, [chainList.cosmosChains, chainList.evmChains, chainList.suiChains]);

  // NOTE 수이, 코스모스
  const { currentAccountAddibleNFTs, isLoading: isCurrentAccountAddibleNFTsLoading } = useCurrentAccountAddibleNFTs();

  const { currentAccountNFTs: currentAddedNFTs, addNFT, removeNFT } = useCurrentAccountNFT();
  const { addedEVMNFTsWithMeta, isLoading: isCurrentAddedEVMNFTsLoading } = useCurrentAddedEVMNFTsWithMetaData();

  const isLoading = useMemo(
    () => isCurrentAccountAddibleNFTsLoading || isCurrentAddedEVMNFTsLoading,
    [isCurrentAccountAddibleNFTsLoading, isCurrentAddedEVMNFTsLoading],
  );

  const addedNFTIds = useMemo(() => currentAddedNFTs.flat.map((item) => item.id), [currentAddedNFTs.flat]);

  const aggregatedNFTs = useMemo<NFTItem[]>(
    () => [...(currentAccountAddibleNFTs.sui as SuiNFTItem[]), ...(addedEVMNFTsWithMeta as EVMNFTItem[])],
    [addedEVMNFTsWithMeta, currentAccountAddibleNFTs.sui],
  );

  const sortedNFTs = useMemo(() => {
    return [...aggregatedNFTs].sort((a, b) => a.name.localeCompare(b.name));
  }, [aggregatedNFTs]);

  const filteredNFTsByChain = useMemo(() => {
    return currentSelectedChainId
      ? sortedNFTs.filter((asset) => getUniqueChainIdWithManual(asset.chainId, asset.chainType) === currentSelectedChainId)
      : sortedNFTs;
  }, [currentSelectedChainId, sortedNFTs]);

  const filteredNFTsBySearch = useMemo(() => {
    if (!!search && debouncedSearch.length > 1) {
      return (
        filteredNFTsByChain.filter((asset) => {
          const condition = [asset.name];

          return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
        }) || []
      );
    }

    return filteredNFTsByChain;
  }, [debouncedSearch, filteredNFTsByChain, search]);

  const sortedByAddedNFTs = useMemo(() => {
    if (initSortKeys && initSortKeys.length > 0) {
      return [...filteredNFTsBySearch].sort((a) => (a.id && initSortKeys.includes(a.id) ? -1 : 1)).slice(0, viewLimit);
    }
    return filteredNFTsBySearch.slice(0, viewLimit);
  }, [filteredNFTsBySearch, initSortKeys, viewLimit]);

  const handleAddNFT = (nftItem: NFTItem) => {
    addNFT(nftItem);
  };

  const handleRemoveNFT = (id: string) => {
    removeNFT(id);
  };

  useEffect(() => {
    if (initSortKeys === undefined && addedNFTIds.length > 0) {
      const initSortKeys = [...addedNFTIds];
      setInitSortKeys(initSortKeys);
    }
  }, [addedNFTIds, initSortKeys]);

  useEffect(() => {
    if (search.length > 1 || search.length === 0) {
      scrollToTop();
      setViewLimit(30);
    }
  }, [scrollToTop, search.length]);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <Container>
            <StickyContainer>
              <Search
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
                searchPlaceholder={t('pages.manage-assets.visibility.nfts.entry.searchPlaceholder')}
                isPending={isDebouncing}
                disableFilter
                onClear={() => {
                  setSearch('');
                  setViewLimit(30);
                  cancel();
                }}
              />

              <RowContainer>
                <AllNetworkButton
                  sizeVariant="medium"
                  typoVarient="b2_M"
                  currentChainId={currentSelectedChainId}
                  chainList={baseChainList}
                  selectChainOption={(id) => {
                    setCurrentSelectedChainId(id);
                  }}
                />

                <IconTextButton
                  onClick={() => {
                    navigate({
                      to: ImportNFT.to,
                    });
                  }}
                  leadingIcon={
                    <PurpleContainer>
                      <PlusIcon />
                    </PurpleContainer>
                  }
                >
                  <ImportTextContainer>
                    <Typography variant="b3_M">{t('pages.manage-assets.visibility.nfts.entry.importNFT')}</Typography>
                  </ImportTextContainer>
                </IconTextButton>
              </RowContainer>
            </StickyContainer>

            <ButtonWrapper>
              {!isDebouncing && !isLoading && (
                <>
                  {sortedByAddedNFTs.map((nftItem) => {
                    const isAdded = addedNFTIds.includes(nftItem.id || '');

                    const uniqueKey = (() => {
                      if (nftItem.chainType === 'sui') {
                        return nftItem.objectId;
                      } else if (nftItem.chainType === 'evm') {
                        return `${nftItem.contractAddress}_${nftItem.tokenId}`;
                      } else if (nftItem.chainType === 'cosmos') {
                        return `${nftItem.contractAddress}_${nftItem.tokenId}`;
                      }
                    })();

                    return (
                      <NFTButtonItem
                        key={uniqueKey}
                        imageURL={nftItem.image}
                        name={nftItem.name}
                        subName={nftItem.subName}
                        chainId={nftItem.chainId}
                        chainType={nftItem.chainType}
                        isActive={isAdded}
                        onClick={() => {
                          if (isAdded && nftItem.id) {
                            if (nftItem.chainType === 'evm' && nftItem.isCustom) {
                              setSupposedDeleteItem(nftItem);
                            } else {
                              handleRemoveNFT(nftItem.id);
                            }
                          } else {
                            handleAddNFT(nftItem);
                          }
                        }}
                      />
                    );
                  })}

                  {filteredNFTsBySearch?.length > viewLimit - 1 && (
                    <IntersectionObserver
                      onIntersect={() => {
                        setViewLimit((limit) => limit + 30);
                      }}
                    />
                  )}
                </>
              )}
            </ButtonWrapper>
          </Container>
        </EdgeAligner>
      </BaseBody>
      <DeleteConfirmBottomSheet
        open={!!suppoesdDeleteNFTItem}
        onClose={() => setSupposedDeleteItem(undefined)}
        contents={
          <DeleteNFTContainer>
            <DeleteNFTImageContainer
              sx={{
                marginBottom: '0.8rem',
              }}
            >
              <DeleteNFTImage src={suppoesdDeleteNFTItem?.image} />
            </DeleteNFTImageContainer>
            <Base1300Text
              variant="b1_B"
              sx={{
                marginBottom: '0.2rem',
              }}
            >
              {suppoesdDeleteNFTItem?.name}
            </Base1300Text>
            <Base1000Text variant="b4_R">{suppoesdDeleteNFTItem?.subName}</Base1000Text>
          </DeleteNFTContainer>
        }
        descriptionText={t('pages.manage-assets.visibility.nfts.entry.deleteCustomNFTDescription')}
        onClickConfirm={() => {
          if (suppoesdDeleteNFTItem?.id) {
            handleRemoveNFT(suppoesdDeleteNFTItem.id);
            setSupposedDeleteItem(undefined);
          }
        }}
      />
    </>
  );
}
