import { useTranslation } from 'react-i18next';
import { InputAdornment } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getKeypair } from '@/libs/address';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import PrivateKeyAccordion from './-components/PrivateKeyAccordion';
import { Body, StyledInput } from './-styled';

import SearchIcon from '@/assets/images/icons/Search18.svg';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  console.log('🚀 ~ Entry ~ accountId:', accountId);

  const { t } = useTranslation();

  const { currentPassword } = useCurrentPassword();
  const { flatChainList } = useChainList();

  const { accounts } = useExtensionStorageStore((state) => state);

  console.log('🚀 ~ Entry ~ accounts:', accounts);

  const account = accounts.find((item) => item.id === accountId);

  console.log('🚀 ~ Entry ~ account:', account);

  console.log(flatChainList.filter((item) => item.accountTypes.length < 1));

  // NOTE 어카운트 타입이 없는 체인은 제외
  const mappedPrivateKeys = account
    ? flatChainList
        .filter((item) => item.accountTypes.length > 0)
        .filter((item) => item.chainType !== 'bitcoin')
        .map((item) => {
          const keypair = getKeypair(item, account, currentPassword);
          return {
            privateKey: `0x${keypair.privateKey}`,
            chain: item,
          };
        })
    : [];

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    console.log('🚀 ~ handleChange ~ panel:', panel);
    console.log('🚀 ~ handleChange ~ isExpanded:', isExpanded);
  };

  return (
    <>
      <BaseBody>
        <Body>
          <StyledInput
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            placeholder={t('pages.view.multi-chain-privateKey.entry.searchPlaceholder')}
            // value={search}
            // onChange={(event) => {
            //   setSearch(event.currentTarget.value);
            // }}
          />
          {mappedPrivateKeys.map((item) => {
            return (
              <PrivateKeyAccordion
                key={item.chain.id}
                isExpand={true}
                ariaControls={item.chain.chainType}
                id={item.chain.chainType}
                handleChange={handleChange}
                name={item.chain.name}
                image={item.chain.image}
                privateKey={item.privateKey}
              />
            );
          })}
        </Body>
      </BaseBody>
    </>
  );
}
