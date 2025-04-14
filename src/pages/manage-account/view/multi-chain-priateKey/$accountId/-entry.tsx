import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EmptyAsset from '@/components/EmptyAsset';
import Search from '@/components/Search';
import { useCurrentMultiChainPK } from '@/hooks/current/useCurrentMultiChainPK';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import PrivateKeyAccordion from './-components/PrivateKeyAccordion';
import { SkeletonWrapper } from './-entry-skeleton';
import { ContentsContainer, EmptyAssetContainer, PrivateAccordionContainer, StickyContainer } from './-styled';

import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  const { t } = useTranslation();

  const { data: mappedPrivateKeys, isLoading } = useCurrentMultiChainPK();

  const { userAccounts } = useExtensionStorageStore((state) => state);

  const [search, setSearch] = useState('');
  const [debouncedSearch, { isPending }] = useDebounce(search, 300);
  const isDebouncing = !!search && isPending();

  const account = userAccounts.find((item) => item.id === accountId);
  const hdPathIndex = account?.type === 'MNEMONIC' ? account.index : '';

  const filteredPrivateKeys = useMemo(() => {
    if (!mappedPrivateKeys) return [];

    const resolvedPKs = mappedPrivateKeys?.map((item) => {
      const hdPath = item.chain.accountTypes.find((i) => i.isDefault !== false)?.hdPath || item.chain.accountTypes[0].hdPath;
      const resolvedHdPath = hdPath.replace('${index}', hdPathIndex);
      return {
        ...item,
        resolvedHdPath,
      };
    });

    return resolvedPKs?.filter(({ chain }) => chain.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1) || [];
  }, [debouncedSearch, hdPathIndex, mappedPrivateKeys]);

  return (
    <BaseBody>
      <StickyContainer>
        <Search
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
          }}
          isPending={isDebouncing}
          placeholder={t('pages.view.multi-chain-privateKey.entry.searchPlaceholder')}
          disableFilter
          onClear={() => {
            setSearch('');
          }}
        />
      </StickyContainer>
      {isLoading ? (
        <SkeletonWrapper />
      ) : (
        <ContentsContainer>
          {filteredPrivateKeys.length > 0 ? (
            <PrivateAccordionContainer>
              {filteredPrivateKeys.map((item) => {
                return (
                  <PrivateKeyAccordion
                    key={item.chain.id.concat(item.chain.chainType).concat(item.id)}
                    name={item.chain.name}
                    image={item.chain.image}
                    hdPath={item.resolvedHdPath}
                    privateKey={item.privateKey}
                    arialControls={`${item.id}-aria-controls`}
                    id={`${item.id}-id`}
                  />
                );
              })}
            </PrivateAccordionContainer>
          ) : (
            <EmptyAssetContainer>
              <EmptyAsset
                icon={<NoSearchIcon />}
                title={t('pages.view.multi-chain-privateKey.entry.noSearchTitle')}
                subTitle={t('pages.view.multi-chain-privateKey.entry.noSearchSubTitle')}
              />
            </EmptyAssetContainer>
          )}
        </ContentsContainer>
      )}
    </BaseBody>
  );
}
