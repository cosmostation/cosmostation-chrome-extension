import { useEffect, useMemo, useState } from 'react';

import Base1300Text from '@/components/common/Base1300Text';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { getAccountAddress } from '@/libs/account';
import type { Account, AccountAddress } from '@/types/account';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AccountButton, AccountInfoContainer, AccountLeftContainer, AddressText, BodyContainer, Container, TopContainer, TopLeftContainer } from './styled';

import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';

type MnemonicAccountProps = {
  mnemonicRestoreString: string;
  chainId: UniqueChainId;
  onClickAddress: (address: string) => void;
};

interface AccountAddressInfo {
  name: string;
  address: AccountAddress;
  account: Account;
}

export default function MnemonicAccount({ mnemonicRestoreString, chainId, onClickAddress }: MnemonicAccountProps) {
  const { currentAccount } = useCurrentAccount();

  const { accounts, accountNamesById, mnemonicNamesByHashedMnemonic } = useExtensionStorageStore((state) => state);

  const filteredAccounts = accounts.filter((item) => item.type === 'MNEMONIC' && item.encryptedRestoreString === mnemonicRestoreString);

  const mnemonicName = mnemonicNamesByHashedMnemonic[mnemonicRestoreString] || '';

  const [accountAddresses, setAccountAddresses] = useState<AccountAddressInfo[]>([]);

  const filteredAccountAddresses = useMemo(
    () =>
      accountAddresses.filter((item) => {
        return !(
          item.account.type === 'MNEMONIC' &&
          currentAccount.type === 'MNEMONIC' &&
          item.account.encryptedRestoreString === currentAccount.encryptedRestoreString &&
          item.account.index === currentAccount.index
        );
      }),
    [accountAddresses, currentAccount],
  );

  useEffect(() => {
    const fetchAccountAddressInfos = async () => {
      const accountAddressInfos: AccountAddressInfo[] = await Promise.all(
        filteredAccounts.map(async (item) => {
          const addresses = await getAccountAddress(item.id);

          const matchingAddress = addresses.find((address) => getUniqueChainIdWithManual(address.chainId, address.chainType) === chainId);

          if (!matchingAddress) return null;

          return {
            name: accountNamesById[item.id],
            address: matchingAddress,
            account: item,
          };
        }),
      ).then((results) => results.filter((item): item is AccountAddressInfo => item !== null));

      setAccountAddresses(accountAddressInfos);
    };

    fetchAccountAddressInfos();
  }, [accountNamesById, chainId, filteredAccounts]);

  if (filteredAccountAddresses.length === 0) {
    return null;
  }

  return (
    <Container>
      <TopContainer>
        <TopLeftContainer>
          <MnemonicIcon />
          <Base1300Text variant="h4_B">{mnemonicName}</Base1300Text>
        </TopLeftContainer>
      </TopContainer>
      <BodyContainer>
        {filteredAccountAddresses.map((item, i) => {
          return (
            <AccountButton
              key={i}
              onClick={() => {
                onClickAddress?.(item.address.address);
              }}
            >
              <AccountLeftContainer>
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
}
