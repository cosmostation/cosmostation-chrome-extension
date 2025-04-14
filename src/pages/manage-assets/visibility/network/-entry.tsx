import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import IconTextButton from '@/components/common/IconTextButton';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import DeleteConfirmBottomSheet from '@/components/DeleteConfirmBottomSheet';
import EmptyAsset from '@/components/EmptyAsset';
import Search from '@/components/Search';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { useCustomAssets } from '@/hooks/useCustomAssets';
import { useCustomChain } from '@/hooks/useCustomChain';
import { useCustomChainParam } from '@/hooks/useCustomChainParam';
import { Route as ImportNetwork } from '@/pages/manage-assets/import/network';
import type { CustomAsset } from '@/types/asset';
import type { CustomChain, UniqueChainId } from '@/types/chain';
import type { CustomChainAsset } from '@/types/customChain';
import { getUniqueChainId, isMatchingUniqueChainId, isSameChain } from '@/utils/queryParamGenerator';

import {
  ButtonWrapper,
  ChainContainer,
  ChainDetailContainer,
  ChainIdContainer,
  ChainImage,
  Container,
  DeleteChainImage,
  EmptyAssetContainer,
  IconContainer,
  ImportTextContainer,
  NetworkCountContainer,
  PurpleContainer,
  RowContainer,
  StickyContainer,
} from './-styled';

import AddIcon from '@/assets/images/icons/Add20.svg';
import NoListIcon from '@/assets/images/icons/NoList70.svg';
import PlusIcon from '@/assets/images/icons/Plus12.svg';
import RemoveIcon from '@/assets/images/icons/Remove20.svg';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { scrollToTop } = useScroll();

  const { data: managedCustomChains, isLoading } = useCustomChainParam();

  const { addedCustomChainList, addCustomChain, removeCustomChain } = useCustomChain();
  const { addCustomAsset } = useCustomAssets();

  const userDefinedCustomChains = addedCustomChainList.filter((chain) => !managedCustomChains?.some((managedChain) => isSameChain(managedChain, chain)));

  const [viewLimit, setViewLimit] = useState(30);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);
  const isDebouncing = !!search && isPending();

  const [suppoesdDeleteChain, setSuppoesdDeleteChain] = useState<CustomChain | undefined>();

  const baseCustomChainList = useMemo(
    () => (!isLoading ? [...(managedCustomChains || []), ...userDefinedCustomChains] : []),
    [isLoading, managedCustomChains, userDefinedCustomChains],
  );

  const sortedBaseCustomChainList = baseCustomChainList.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  });

  const filteredCustomChainBySearch = (() => {
    if (!!search && debouncedSearch.length > 1) {
      return (
        sortedBaseCustomChainList?.filter((customChainAsset) => {
          const condition = [customChainAsset.name, customChainAsset.chainId];

          return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
        }) || []
      );
    }
    return sortedBaseCustomChainList || [];
  })();

  const sortedCoinListByHidden = useMemo(() => {
    const addedCustomChains = filteredCustomChainBySearch.filter((item) => addedCustomChainList.some((added) => isSameChain(added, item)));

    const notAddedCustomChains = filteredCustomChainBySearch.filter((item) => !addedCustomChainList.some((added) => isSameChain(added, item)));

    return [...addedCustomChains, ...notAddedCustomChains].slice(0, viewLimit);
  }, [addedCustomChainList, filteredCustomChainBySearch, viewLimit]);

  const customChainListCount = sortedCoinListByHidden?.length || 0;

  const addCustom = async (customChainAsset: CustomChainAsset) => {
    const mainCoin: CustomAsset = {
      id: customChainAsset.mainAssetDenom,
      chainId: customChainAsset.id,
      chainType: customChainAsset.chainType,
      type: 'native',
      name: customChainAsset.mainAssetSymbol,
      symbol: customChainAsset.mainAssetSymbol,
      decimals: customChainAsset.mainAssetDecimals,
      image: customChainAsset.mainAssetImage || '',
      coinGeckoId: customChainAsset.mainAssetCoinGeckoId || '',
    };

    await addCustomChain(customChainAsset);

    await addCustomAsset(mainCoin);
  };

  const removeCustom = async (chainId: UniqueChainId) => {
    const userDefinedCustomChain = userDefinedCustomChains.find((item) => isMatchingUniqueChainId(item, chainId));
    if (userDefinedCustomChain) {
      setSuppoesdDeleteChain(userDefinedCustomChain);
    } else {
      await removeCustomChain(chainId);
    }
  };

  useEffect(() => {
    if (search.length > 1 || search.length === 0) {
      scrollToTop();
      setViewLimit(30);
    }
  }, [scrollToTop, search.length]);

  return (
    <>
      <BaseBody>
        <EdgeAligner
          style={{
            flex: 1,
          }}
        >
          <Container>
            <StickyContainer>
              <Search
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
                searchPlaceholder={t('pages.manage-assets.visibility.network.entry.searchPlaceholder')}
                isPending={isDebouncing}
                disableFilter
                onClear={() => {
                  setSearch('');
                  setViewLimit(30);
                  cancel();
                }}
              />

              <RowContainer>
                <NetworkCountContainer>
                  <Base1300Text variant="h4_B">{t('pages.manage-assets.visibility.network.entry.network')}</Base1300Text>
                  <Base1000Text variant="h4_B">{customChainListCount}</Base1000Text>
                </NetworkCountContainer>

                <IconTextButton
                  onClick={() => {
                    navigate({
                      to: ImportNetwork.to,
                    });
                  }}
                  leadingIcon={
                    <PurpleContainer>
                      <PlusIcon />
                    </PurpleContainer>
                  }
                >
                  <ImportTextContainer>
                    <Typography variant="b3_M">{t('pages.manage-assets.visibility.network.entry.importNetwork')}</Typography>
                  </ImportTextContainer>
                </IconTextButton>
              </RowContainer>
            </StickyContainer>

            <ButtonWrapper>
              {!isDebouncing && (
                <>
                  {sortedCoinListByHidden.length === 0 && (
                    <EmptyAssetContainer>
                      <EmptyAsset
                        icon={<NoListIcon />}
                        title={t('pages.manage-assets.visibility.network.entry.noCustomChains')}
                        subTitle={t('pages.manage-assets.visibility.network.entry.noCustomChainsDescription')}
                      />
                    </EmptyAssetContainer>
                  )}

                  {sortedCoinListByHidden.map((customChainAsset) => {
                    const isAdded = addedCustomChainList.some((addedCustomChain) => getUniqueChainId(addedCustomChain) === getUniqueChainId(customChainAsset));

                    const uniqueChainId = getUniqueChainId(customChainAsset);
                    return (
                      <BaseOptionButton
                        key={uniqueChainId}
                        leftContent={<ChainImage src={customChainAsset.image || ''} />}
                        leftSecondHeader={<Base1300Text variant="b2_M">{customChainAsset.name}</Base1300Text>}
                        leftSecondBody={<Base1000Text variant="b4_R">{customChainAsset.chainId}</Base1000Text>}
                        rightContent={
                          isAdded ? (
                            <IconContainer>
                              <RemoveIcon />
                            </IconContainer>
                          ) : (
                            <IconContainer>
                              <AddIcon />
                            </IconContainer>
                          )
                        }
                        disableRightChevron
                        onClick={() => {
                          const targetCustomChain = managedCustomChains?.find((chain) => isMatchingUniqueChainId(chain, uniqueChainId));

                          if (targetCustomChain && !isAdded) {
                            addCustom(targetCustomChain);
                          } else {
                            removeCustom(uniqueChainId);
                          }
                        }}
                      />
                    );
                  })}

                  {filteredCustomChainBySearch?.length > viewLimit - 1 && (
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
        open={!!suppoesdDeleteChain}
        onClose={() => setSuppoesdDeleteChain(undefined)}
        contents={
          <ChainContainer>
            <DeleteChainImage src={suppoesdDeleteChain?.image} />
            <ChainDetailContainer>
              <Base1300Text variant="b1_B">{suppoesdDeleteChain?.name}</Base1300Text>
              <ChainIdContainer>
                <Base1000Text variant="b4_R">{t('pages.manage-assets.visibility.network.entry.chainId')}</Base1000Text>
                &nbsp;
                <Base1000Text variant="b3_M">{suppoesdDeleteChain?.chainId}</Base1000Text>
              </ChainIdContainer>
            </ChainDetailContainer>
          </ChainContainer>
        }
        descriptionText={t('pages.manage-assets.visibility.network.entry.deleteCustomChainDescription')}
        onClickConfirm={async () => {
          if (suppoesdDeleteChain) {
            await removeCustomChain(getUniqueChainId(suppoesdDeleteChain));
            setSuppoesdDeleteChain(undefined);
          }
        }}
      />
    </>
  );
}
