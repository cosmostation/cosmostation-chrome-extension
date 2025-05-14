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
import { VirtualizedList } from '@/components/common/VirtualizedList';
import DeleteConfirmBottomSheet from '@/components/DeleteConfirmBottomSheet';
import Search from '@/components/Search';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { useCurrentAddedCosmosNFTsWithMetaData } from '@/hooks/cosmos/nft/useCurrentAddedCosmosNFTsWithMetaData';
import { useCurrentAddedEVMNFTsWithMetaData } from '@/hooks/evm/nft/useCurrentAddedEVMNFTsWithMetaData';
import { useCurrentAddedIotaNFTsWithMetaData } from '@/hooks/iota/useCurrentAddedIotaNFTsWithMetaData';
import { useCurrentAddedSuiNFTsWithMetaData } from '@/hooks/sui/useCurrentAddedSuiNFTsWithMetaData';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccountAddibleNFTs } from '@/hooks/useCurrentAccountAddibleNFTs';
import { useCurrentAccountNFT } from '@/hooks/useCurrentAccountNFT';
import { Route as ImportNFT } from '@/pages/manage-assets/import/nft';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import NFTButtonItem, { NFTSkeletonButtonItem } from './-components/NFTButtonItem';
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
  isOwned: boolean;
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
  isOwned: boolean;
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
  isOwned: boolean;
};

type IotaNFTItem = {
  id?: string;
  accountId: string;
  chainId: string;
  chainType: 'iota';
  ownerAddress: string;
  name: string;
  subName: string;
  image: string;
  objectId: string;
  type: string;
  isOwned: boolean;
};

type NFTItem = SuiNFTItem | EVMNFTItem | CosmosNFTItem | IotaNFTItem;

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { scrollToTop } = useScroll();

  const { chainList } = useChainList();

  const [suppoesdDeleteNFTItem, setSupposedDeleteItem] = useState<NFTItem | undefined>();

  const [initSortKeys, setInitSortKeys] = useState<string[] | undefined>(undefined);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const isDebouncing = !!search && isPending();

  const [currentSelectedChainId, setCurrentSelectedChainId] = useState<UniqueChainId | undefined>();

  const baseChainList = useMemo(() => {
    const cosmosChains = chainList.cosmosChains?.filter((item) => item.isCosmwasm || item.isSupportCW721) || [];

    return [...cosmosChains, ...(chainList.evmChains || []), ...(chainList.suiChains || []), ...(chainList.iotaChains || [])];
  }, [chainList.cosmosChains, chainList.evmChains, chainList.iotaChains, chainList.suiChains]);

  const { currentAccountAddibleNFTs, isLoading: isCurrentAccountAddibleNFTsLoading } = useCurrentAccountAddibleNFTs();

  const { currentAccountNFTs: currentAddedNFTs, addNFT, removeNFT } = useCurrentAccountNFT();

  const { addedEVMNFTsWithMeta, isLoading: isCurrentAddedEVMNFTsLoading } = useCurrentAddedEVMNFTsWithMetaData();
  const { addedCosmosNFTsWithMeta } = useCurrentAddedCosmosNFTsWithMetaData();
  const { addedSuiNFTsWithMeta } = useCurrentAddedSuiNFTsWithMetaData();
  const { addedIotaNFTsWithMeta } = useCurrentAddedIotaNFTsWithMetaData();

  const wrappedCosmosNFTs = useMemo(() => {
    const addedComsosNFTsWithoutReRender = currentAddedNFTs.cosmos
      .map((item) => {
        const addibleItem = currentAccountAddibleNFTs.cosmos.find(
          (addibleItem) => addibleItem.contractAddress === item.contractAddress && addibleItem.tokenId === item.tokenId,
        );

        if (addibleItem) {
          return {
            ...addibleItem,
            id: item.id,
            chainId: item.chainId,
            chainType: item.chainType,
            contractAddress: item.contractAddress,
            tokenId: item.tokenId,
            tokenType: item.tokenType,
          };
        }

        const addedCosmosNFTWithMeta = addedCosmosNFTsWithMeta.find(
          (addedItem) => addedItem.contractAddress === item.contractAddress && addedItem.tokenId === item.tokenId,
        );

        if (addedCosmosNFTWithMeta) {
          return addedCosmosNFTWithMeta;
        }

        return {
          ...item,
          name: '-',
          subName: `Contract : ${shorterAddress(item.contractAddress, 14)}`,
        };
      })
      .filter((item) => item !== null) as CosmosNFTItem[];

    const addibleNFTs = currentAccountAddibleNFTs.cosmos.filter((addibleItem) => {
      return !addedComsosNFTsWithoutReRender.some((item) => addibleItem.contractAddress === item.contractAddress && addibleItem.tokenId === item.tokenId);
    });

    return [...addedComsosNFTsWithoutReRender, ...addibleNFTs] as CosmosNFTItem[];
  }, [addedCosmosNFTsWithMeta, currentAccountAddibleNFTs.cosmos, currentAddedNFTs.cosmos]);

  const wrappedSuiNFTs = useMemo(() => {
    const addibleNFTs = currentAccountAddibleNFTs.sui.filter((addibleItem) => {
      return !addedSuiNFTsWithMeta.some((item) => addibleItem.objectId === item.objectId);
    });

    return [...addedSuiNFTsWithMeta, ...addibleNFTs] as SuiNFTItem[];
  }, [addedSuiNFTsWithMeta, currentAccountAddibleNFTs.sui]);

  const wrappedIotaNFTs = useMemo(() => {
    const addibleNFTs = currentAccountAddibleNFTs.iota.filter((addibleItem) => {
      return !addedIotaNFTsWithMeta.some((item) => addibleItem.objectId === item.objectId);
    });

    return [...addedIotaNFTsWithMeta, ...addibleNFTs] as IotaNFTItem[];
  }, [addedIotaNFTsWithMeta, currentAccountAddibleNFTs.iota]);

  const isLoading = useMemo(
    () => isCurrentAccountAddibleNFTsLoading || isCurrentAddedEVMNFTsLoading,
    [isCurrentAccountAddibleNFTsLoading, isCurrentAddedEVMNFTsLoading],
  );

  const addedNFTIds = useMemo(() => currentAddedNFTs.flat.map((item) => item.id), [currentAddedNFTs.flat]);

  const aggregatedNFTs = useMemo<NFTItem[]>(
    () => [...wrappedSuiNFTs, ...(addedEVMNFTsWithMeta as EVMNFTItem[]), ...wrappedCosmosNFTs, ...wrappedIotaNFTs],
    [wrappedSuiNFTs, addedEVMNFTsWithMeta, wrappedCosmosNFTs, wrappedIotaNFTs],
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
      return [...filteredNFTsBySearch].sort((a) => (a.id && initSortKeys.includes(a.id) ? -1 : 1));
    }
    return filteredNFTsBySearch;
  }, [filteredNFTsBySearch, initSortKeys]);

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
                  cancel();
                }}
              />

              <RowContainer>
                <AllNetworkButton
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
              {isLoading ? (
                <>
                  <NFTSkeletonButtonItem />
                  <NFTSkeletonButtonItem />
                  <NFTSkeletonButtonItem />
                  <NFTSkeletonButtonItem />
                </>
              ) : (
                !isDebouncing && (
                  <>
                    {
                      <VirtualizedList
                        items={sortedByAddedNFTs}
                        estimateSize={() => 86}
                        renderItem={(nftItem) => {
                          const isAdded = addedNFTIds.includes(nftItem.id || '');

                          const uniqueKey = (() => {
                            if (nftItem.chainType === 'sui' || nftItem.chainType === 'iota') {
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
                              isOwned={nftItem.isOwned}
                              onClick={() => {
                                if (isAdded && nftItem.id) {
                                  const isCustomEVMNFT = nftItem.chainType === 'evm' && nftItem.isCustom;
                                  const isCustomCosmosNFT =
                                    nftItem.chainType === 'cosmos' &&
                                    !currentAccountAddibleNFTs.cosmos.some(
                                      (item) => item.contractAddress === nftItem.contractAddress && item.tokenId === nftItem.tokenId,
                                    );
                                  const isCustomSuiNFT =
                                    nftItem.chainType === 'sui' && !currentAccountAddibleNFTs.sui.some((item) => item.objectId === nftItem.objectId);
                                  const isCustomIotaNFT =
                                    nftItem.chainType === 'iota' && !currentAccountAddibleNFTs.iota.some((item) => item.objectId === nftItem.objectId);

                                  if (isCustomEVMNFT || isCustomCosmosNFT || isCustomSuiNFT || isCustomIotaNFT) {
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
                        }}
                        overscan={5}
                      />
                    }
                  </>
                )
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
