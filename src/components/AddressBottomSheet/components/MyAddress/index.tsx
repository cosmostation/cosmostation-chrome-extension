import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import type { Account, AccountAddress } from '@/types/account';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AccountButton,
  AccountImgContainer,
  AccountInfoContainer,
  AccountLeftContainer,
  AddressText,
  BodyContainer,
  Container,
  TopContainer,
  TopLeftContainer,
  WrapperContainer,
} from './styled';

import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
import PrivatekeyIcon from '@/assets/images/icons/PrivateKey14.svg';

type MnemonicAccountProps = {
  chainId: UniqueChainId;
  filterAddress?: string;
  onClickAddress: (address: string) => void;
};

interface AccountAddressInfo {
  name: string;
  address: AccountAddress;
  account: Account;
}

export default function MnemonicAccount({ chainId, filterAddress, onClickAddress }: MnemonicAccountProps) {
  const { t } = useTranslation();

  const { accounts, accountNamesById, mnemonicNamesByHashedMnemonic } = useExtensionStorageStore((state) => state);

  const accountIds = accounts.map((account) => account.id);

  const addressesMap = accountIds.reduce(
    (acc, id) => {
      const accountAddresses = useExtensionStorageStore.getState()[`${id}-address`];

      return { ...acc, [id]: accountAddresses };
    },
    {} as Record<string, AccountAddress[]>,
  );

  const uniqueMnemonicRestoreString = accounts
    .filter((item) => item.type === 'MNEMONIC')
    .map((account) => account.encryptedRestoreString)
    .filter((value, index, self) => self.indexOf(value) === index);

  const privatekeyAccounts = accounts.filter((item) => item.type === 'PRIVATE_KEY');

  const filteredMnemonicAccounts = uniqueMnemonicRestoreString
    .map((restoreString) => {
      const filteredMnemonicAccounts = accounts.filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === restoreString);

      const filteredAccountAddresses = filteredMnemonicAccounts
        .map((item) => {
          const addressList = addressesMap[item.id];
          const matchingAddress = addressList?.find((address) => getUniqueChainIdWithManual(address.chainId, address.chainType) === chainId);

          if (filterAddress && matchingAddress?.address) {
            if (matchingAddress.address === filterAddress) return null;
          }

          return {
            name: accountNamesById[item.id],
            address: matchingAddress,
            account: item,
          };
        })
        .filter((item) => item !== null) as AccountAddressInfo[];

      return {
        id: restoreString,
        accounts: filteredAccountAddresses,
      };
    })
    .filter((item) => item.accounts.length > 0);

  const filteredPrivatekeyAccounts = privatekeyAccounts
    .map((item) => {
      const addressList = addressesMap[item.id];

      const matchingAddress = addressList?.find((address) => getUniqueChainIdWithManual(address.chainId, address.chainType) === chainId);

      if (filterAddress && matchingAddress?.address) {
        if (matchingAddress.address === filterAddress) return null;
      }

      return {
        name: accountNamesById[item.id],
        address: matchingAddress,
        account: item,
      };
    })
    .filter((item) => item !== null) as AccountAddressInfo[];

  if (filteredMnemonicAccounts.length === 0 && filteredPrivatekeyAccounts.length === 0) {
    return null;
  }

  return (
    <WrapperContainer>
      {filteredMnemonicAccounts.map((item) => {
        const mnemonicName = mnemonicNamesByHashedMnemonic[item.id];

        return (
          <Container key={item.id}>
            <TopContainer>
              <TopLeftContainer>
                <MnemonicIcon />
                <Base1300Text variant="h4_B">{mnemonicName}</Base1300Text>
              </TopLeftContainer>
            </TopContainer>
            <BodyContainer>
              {item.accounts.map((item, i) => {
                return (
                  <AccountButton
                    key={i}
                    onClick={() => {
                      onClickAddress?.(item.address.address);
                    }}
                  >
                    <AccountLeftContainer>
                      <AccountImgContainer />

                      <AccountInfoContainer>
                        <Base1300Text variant="b2_M">{item.name}</Base1300Text>
                        <AddressText variant="b4_M">{item.address.address}</AddressText>
                      </AccountInfoContainer>
                    </AccountLeftContainer>
                  </AccountButton>
                );
              })}
            </BodyContainer>
          </Container>
        );
      })}
      {filteredPrivatekeyAccounts.length > 0 && (
        <>
          <TopContainer>
            <TopLeftContainer>
              <PrivatekeyIcon />
              <Base1300Text variant="h4_B">{t('components.AddressBottomSheet.components.PrivatekeyAccount')}</Base1300Text>
            </TopLeftContainer>
          </TopContainer>
          <BodyContainer>
            {filteredPrivatekeyAccounts.map((item, i) => {
              return (
                <AccountButton
                  key={i}
                  onClick={() => {
                    onClickAddress?.(item.address.address);
                  }}
                >
                  <AccountLeftContainer>
                    <AccountImgContainer />

                    <AccountInfoContainer>
                      <Base1300Text variant="b2_M">{item.name}</Base1300Text>
                      <AddressText variant="b4_M">{item.address.address}</AddressText>
                    </AccountInfoContainer>
                  </AccountLeftContainer>
                </AccountButton>
              );
            })}
          </BodyContainer>
        </>
      )}
    </WrapperContainer>
  );
}
