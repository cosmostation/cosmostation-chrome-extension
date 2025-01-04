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
import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import IconTextButton from '@/components/common/IconTextButton';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import Search from '@/components/Search';
import { useScroll } from '@/components/Wrapper/components/ScrollProvider';
import { useCustomAssets } from '@/hooks/useCustomAssets';
import { useCustomChain } from '@/hooks/useCustomChain';
import { useCustomChainParam } from '@/hooks/useCustomChainParam';
import { Route as ImportNetwork } from '@/pages/manage-assets/import/network';
import type { CustomAsset } from '@/types/asset';
import type { UniqueChainId } from '@/types/chain';
import type { CustomChainAsset } from '@/types/customChain';
import { getUniqueChainId, isMatchingUniqueChainId, isSameChain } from '@/utils/queryParamGenerator';

import {
  ButtonWrapper,
  ChainImage,
  Container,
  IconContainer,
  ImportTextContainer,
  NetworkCountContainer,
  PurpleContainer,
  RowContainer,
  StickyContainer,
} from './-styled';

import AddIcon from '@/assets/images/icons/Add20.svg';
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

  const [isViewTestnet, setIsViewTestnet] = useState(false);

  const baseCustomChainList = useMemo(
    () => (!isLoading ? [...(managedCustomChains || []), ...userDefinedCustomChains] : []),
    [isLoading, managedCustomChains, userDefinedCustomChains],
  );

  const customChainListCount = baseCustomChainList?.length || 0;

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
    await removeCustomChain(chainId);
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
        <EdgeAligner>
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
                <CheckBoxTextButton
                  isChecked={isViewTestnet}
                  onClick={() => {
                    setIsViewTestnet(!isViewTestnet);
                  }}
                >
                  <Base1000Text variant="b3_R">{t('pages.manage-assets.visibility.network.entry.viewTestnet')}</Base1000Text>
                </CheckBoxTextButton>

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
              <RowContainer>
                <NetworkCountContainer>
                  <Base1300Text variant="h4_B">{t('pages.manage-assets.visibility.network.entry.network')}</Base1300Text>
                  <Base1000Text variant="h4_B">{customChainListCount}</Base1000Text>
                </NetworkCountContainer>
              </RowContainer>
            </StickyContainer>

            <ButtonWrapper>
              {!isDebouncing && (
                <>
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
    </>
  );
}
