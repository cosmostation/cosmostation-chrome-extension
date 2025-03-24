import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useNavigate } from '@tanstack/react-router';

import IconTextButton from '@/components/common/IconTextButton';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import EmptyAsset from '@/components/EmptyAsset';
import Search from '@/components/Search';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { useCurrentAccountAddedNFTsWithMetaData } from '@/hooks/useCurrentAccountAddedNFTsWithMetaData';
import { Route as ManageNFTs } from '@/pages/manage-assets/visibility/nfts';
import { Route as NFTDetail } from '@/pages/nft-detail/$id';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';

import NFTItem, { NFTSkeletonItem } from './components/NFTItem';
import {
  Contaienr,
  EmptyAssetContainer,
  FilterContaienr,
  ManageCryptoContainer,
  MarginLeftTypography,
  NFTGridContainer,
  NFTItemWrapper,
  StickyTabPanelContentsContainer,
} from './styled';

import NoListIcon from '@/assets/images/icons/NoList70.svg';
import PlusIcon from '@/assets/images/icons/Plus12.svg';

export type NFTListProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  selectedChainId?: UniqueChainId;
};

export default function NFTList({ selectedChainId, ...reamainder }: NFTListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const [viewLimit, setViewLimit] = useState(30);

  const { scrollToTop } = useScroll();
  const { currentAccountAddNFTsWithMeta, isLoading } = useCurrentAccountAddedNFTsWithMetaData();

  const isNFTSearchingDebouncing = !!search && isPending();

  const filteredNFTs = useMemo(() => {
    const flatNFTs = currentAccountAddNFTsWithMeta.flat;

    const filteredNFTsByChain = selectedChainId
      ? flatNFTs.filter((nft) => getUniqueChainIdWithManual(nft.chainId, nft.chainType) === selectedChainId)
      : flatNFTs;

    if (!!search && debouncedSearch.length > 1) {
      return (
        filteredNFTsByChain
          .filter((nft) => {
            const condition = [nft.name];

            return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
          })
          .slice(0, viewLimit) || []
      );
    }
    return filteredNFTsByChain.slice(0, viewLimit);
  }, [currentAccountAddNFTsWithMeta.flat, debouncedSearch, search, selectedChainId, viewLimit]);

  useEffect(() => {
    if (search.length > 1 || search.length === 0) {
      scrollToTop();
      setViewLimit(30);
    }
  }, [scrollToTop, search.length]);

  return (
    <Contaienr {...reamainder}>
      <StickyTabPanelContentsContainer>
        <FilterContaienr>
          <Search
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
            placeholder={t('pages.components.NFTList.index.search')}
            isPending={isNFTSearchingDebouncing}
            disableFilter
            onClear={() => {
              setSearch('');
              setViewLimit(30);
              cancel();
            }}
          />
        </FilterContaienr>
        <ManageCryptoContainer>
          <IconTextButton
            onClick={() => [
              navigate({
                to: ManageNFTs.to,
              }),
            ]}
            leadingIcon={<PlusIcon />}
          >
            <MarginLeftTypography variant="b3_M">{t('pages.components.NFTList.index.manageNFT')}</MarginLeftTypography>
          </IconTextButton>
        </ManageCryptoContainer>
      </StickyTabPanelContentsContainer>

      <NFTItemWrapper>
        {isLoading ? (
          <NFTListSkeleton />
        ) : filteredNFTs.length > 0 ? (
          <NFTGridContainer>
            {filteredNFTs.map((nft) => {
              return (
                <NFTItem
                  key={nft.id}
                  name={nft.name}
                  chainId={nft.chainId}
                  chainType={nft.chainType}
                  isOwned={nft.isOwned}
                  imageURL={nft.image}
                  onClick={() => {
                    navigate({
                      to: NFTDetail.to,
                      params: {
                        id: nft.id,
                      },
                    });
                  }}
                />
              );
            })}
            {filteredNFTs?.length > viewLimit - 1 && (
              <IntersectionObserver
                onIntersect={() => {
                  setViewLimit((limit) => limit + 30);
                }}
              />
            )}
          </NFTGridContainer>
        ) : (
          <EmptyAssetContainer>
            <EmptyAsset
              icon={<NoListIcon />}
              title={t('pages.components.NFTList.index.noNFT')}
              subTitle={t('pages.components.NFTList.index.noNFTDescription')}
            />
          </EmptyAssetContainer>
        )}
      </NFTItemWrapper>
    </Contaienr>
  );
}

export function NFTListSkeleton() {
  return (
    <NFTItemWrapper>
      <NFTGridContainer>
        <NFTSkeletonItem />
        <NFTSkeletonItem />
        <NFTSkeletonItem />
        <NFTSkeletonItem />
        <NFTSkeletonItem />
        <NFTSkeletonItem />
      </NFTGridContainer>
    </NFTItemWrapper>
  );
}
