import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { v4 as uuidv4 } from 'uuid';
import { InputAdornment } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import PrivateKeyAccordion from './-components/PrivateKeyAccordion';
import { Body, PrivateAccordionContainer, StickyContainer, StyledInput } from './-styled';

import SearchIcon from '@/assets/images/icons/Search18.svg';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  const { t } = useTranslation();

  const { currentPassword } = useCurrentPassword();
  const { flatChainList, isLoading } = useChainList();

  const { accounts } = useExtensionStorageStore((state) => state);

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const account = accounts.find((item) => item.id === accountId);
  const hdPathIndex = account?.type === 'MNEMONIC' ? account.index : '';

  // NOTE FOR TEST 어카운트 타입이 없는 체인은 제외
  // FIXME 중복되는 아이템이 존재하여 검색 시 필터링이 이상하게 동작 + 필터링되지 않는 아이템의 클릭이 안되는 이슈
  // TODO 어카운트 타입 하나당 체인하나로 필터링 로직 필요.
  const mappedPrivateKeys = useMemo(() => {
    return account
      ? flatChainList
          .filter((item) => item.accountTypes.length > 0)
          // FIXME 비트코인 로직 구현전까지 필터링
          .filter((item) => item.chainType !== 'bitcoin')
          .map((item) => {
            const keypair = getKeypair(item, account, currentPassword);
            return {
              id: uuidv4(),
              privateKey: `0x${keypair.privateKey}`,
              chain: item,
            };
          })
      : [];
  }, [account, currentPassword, flatChainList]);

  const filteredPrivateKeys = useMemo(
    () => mappedPrivateKeys.filter(({ chain }) => chain.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1),
    [debouncedSearch, mappedPrivateKeys],
  );

  return (
    <>
      <BaseBody>
        <Body>
          <StickyContainer>
            <StyledInput
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
              placeholder={t('pages.view.multi-chain-privateKey.entry.searchPlaceholder')}
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
              }}
            />
          </StickyContainer>

          {isLoading ? (
            <div>loading...</div>
          ) : (
            <PrivateAccordionContainer>
              {filteredPrivateKeys.map((item) => {
                const hdPath = item.chain.accountTypes.find((item) => item.is_default !== false)?.hdPath || item.chain.accountTypes[0].hdPath;
                const resolvedHdPath = hdPath.replace('${index}', hdPathIndex);

                return (
                  <PrivateKeyAccordion
                    key={item.chain.id}
                    name={item.chain.name}
                    image={item.chain.image}
                    hdPath={resolvedHdPath}
                    privateKey={item.privateKey}
                    arialControls={`${item.id}-aria-controls`}
                    id={`${item.id}-id`}
                  />
                );
              })}
            </PrivateAccordionContainer>
          )}
        </Body>
      </BaseBody>
    </>
  );
}
