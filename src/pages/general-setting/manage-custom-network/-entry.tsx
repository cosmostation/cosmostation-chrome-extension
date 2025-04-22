import { useState } from 'react';
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
import EmptyAsset from '@/components/EmptyAsset';
import Search from '@/components/Search';
import { useCustomChain } from '@/hooks/useCustomChain';
import { useCustomChainParam } from '@/hooks/useCustomChainParam';
import { Route as EditCustomNetwork } from '@/pages/general-setting/manage-custom-network/edit/$id';
import { Route as ImportNetwork } from '@/pages/manage-assets/import/network';
import { getUniqueChainIdWithManual, isSameChain } from '@/utils/queryParamGenerator';

import {
  ButtonWrapper,
  ChainImage,
  ChipButtonContentsContainer,
  Container,
  EmptyAssetContainer,
  IconContainer,
  ImportTextContainer,
  NetworkCounts,
  PurpleContainer,
  RowContainer,
  StickyContainer,
} from './-styled';

import NoListIcon from '@/assets/images/icons/NoList70.svg';
import PlusIcon from '@/assets/images/icons/Plus12.svg';
import RightArrowIcon from '@/assets/images/icons/RightArrow14.svg';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: managedCustomChains } = useCustomChainParam();
  const { addedCustomChainList } = useCustomChain();

  const userDefinedCustomChains = addedCustomChainList.filter((chain) => !managedCustomChains?.some((managedChain) => isSameChain(managedChain, chain)));

  const chainsCount = userDefinedCustomChains.length;

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const filteredCustomChains = (() => {
    if (!!search && debouncedSearch.length > 1) {
      return (
        userDefinedCustomChains.filter((chain) => {
          const condition = [chain.name, chain.chainId];

          return condition.some((item) => item.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);
        }) || []
      );
    }
    return userDefinedCustomChains;
  })();

  return (
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
              searchPlaceholder={t('pages.general-setting.manage-custom-network.entry.search')}
              isPending={isDebouncing}
              disableFilter
              onClear={() => {
                setSearch('');
                cancel();
              }}
            />

            <RowContainer>
              <Base1300Text variant="b3_M">
                {t('pages.general-setting.manage-custom-network.entry.network')}
                &nbsp;
                <NetworkCounts>{chainsCount}</NetworkCounts>
              </Base1300Text>
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
                  <Typography variant="b3_M">{t('pages.general-setting.manage-custom-network.entry.importNetwork')}</Typography>
                </ImportTextContainer>
              </IconTextButton>
            </RowContainer>
          </StickyContainer>
          <ButtonWrapper>
            {!isDebouncing && (
              <>
                {filteredCustomChains.length === 0 && (
                  <EmptyAssetContainer>
                    <EmptyAsset
                      icon={<NoListIcon />}
                      title={t('pages.general-setting.manage-custom-network.entry.noCustomChains')}
                      subTitle={t('pages.general-setting.manage-custom-network.entry.noCustomChainsDescription')}
                      chipButtonProps={{
                        onClick: () => {
                          navigate({
                            to: ImportNetwork.to,
                          });
                        },
                        children: (
                          <ChipButtonContentsContainer>
                            <Base1300Text variant="b3_M">{t('pages.general-setting.manage-custom-network.entry.goToAdd')}</Base1300Text>
                            <IconContainer>
                              <RightArrowIcon />
                            </IconContainer>
                          </ChipButtonContentsContainer>
                        ),
                      }}
                    />
                  </EmptyAssetContainer>
                )}

                {filteredCustomChains.map((item) => (
                  <BaseOptionButton
                    key={item.id}
                    leftContent={<ChainImage src={item.image} />}
                    leftSecondHeader={<Base1300Text variant="b2_M">{item.name}</Base1300Text>}
                    leftSecondBody={<Base1000Text variant="b4_R">{item.chainId}</Base1000Text>}
                    onClick={() => {
                      navigate({
                        to: EditCustomNetwork.to,
                        params: { id: getUniqueChainIdWithManual(item.id, item.chainType) },
                      });
                    }}
                  />
                ))}
              </>
            )}
          </ButtonWrapper>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
