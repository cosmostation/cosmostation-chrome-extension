import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import type { Account, AccountAddress } from '@/types/account';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase, shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AccountButton,
  AccountImgContainer,
  AccountInfoContainer,
  AccountLeftContainer,
  AddressText,
  Badge,
  BodyContainer,
  Container,
  TitleContainer,
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

type AccountAddressDetails = AccountAddress & {
  name: string;
  badge?: {
    text: string;
    color: string;
  };
};

interface AccountAddressInfo {
  addressDetails: AccountAddressDetails[];
  account: Account;
}

export default function MnemonicAccount({ chainId, filterAddress, onClickAddress }: MnemonicAccountProps) {
  const { t } = useTranslation();

  const { accounts, accountNamesById, mnemonicNamesByHashedMnemonic } = useExtensionStorageStore((state) => state);

  const accountIds = useMemo(() => accounts.map((account) => account.id), [accounts]);

  const addressesMap = useMemo(
    () =>
      accountIds.reduce(
        (acc, id) => {
          const accountAddresses = useExtensionStorageStore.getState()[`${id}-address`];

          return { ...acc, [id]: accountAddresses };
        },
        {} as Record<string, AccountAddress[]>,
      ),
    [accountIds],
  );

  const uniqueMnemonicRestoreString = useMemo(
    () =>
      accounts
        .filter((item) => item.type === 'MNEMONIC')
        .map((account) => account.encryptedRestoreString)
        .filter((value, index, self) => self.indexOf(value) === index),
    [accounts],
  );

  const privatekeyAccounts = useMemo(() => accounts.filter((item) => item.type === 'PRIVATE_KEY'), [accounts]);

  const filteredMnemonicAccounts = useMemo(
    () =>
      uniqueMnemonicRestoreString
        .map((restoreString) => {
          const filteredMnemonicAccounts = accounts.filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === restoreString);

          const filteredAccountAddresses = filteredMnemonicAccounts
            .map((item) => {
              const addressList = addressesMap[item.id];

              const matchingAddresses = filterMatchingAddresses(addressList, chainId, filterAddress);

              const matchingAddressesWithBadge = matchingAddresses.map((addressInfo) => ({
                ...addressInfo,
                name: accountNamesById[item.id],
                badge: getBadgeDetail(addressInfo),
              }));

              return {
                addressDetails: matchingAddressesWithBadge,
                account: item,
              };
            })
            .filter((item) => item !== null) as AccountAddressInfo[];

          return {
            id: restoreString,
            accounts: filteredAccountAddresses,
          };
        })
        .filter((item) => item.accounts.length > 0),
    [accountNamesById, accounts, addressesMap, chainId, filterAddress, uniqueMnemonicRestoreString],
  );

  const filteredPrivatekeyAccounts = useMemo(
    () =>
      privatekeyAccounts
        .map((item) => {
          const addressList = addressesMap[item.id];

          const matchingAddresses = filterMatchingAddresses(addressList, chainId, filterAddress);

          const matchingAddressesWithBadge = matchingAddresses.map((addressInfo) => ({
            ...addressInfo,
            name: accountNamesById[item.id],
            badge: getBadgeDetail(addressInfo),
          }));

          return {
            addressDetails: matchingAddressesWithBadge,
            account: item,
          };
        })
        .filter((item) => item !== null) as AccountAddressInfo[],
    [accountNamesById, addressesMap, chainId, filterAddress, privatekeyAccounts],
  );

  const privateKeyAddresses = useMemo(() => filteredPrivatekeyAccounts.map((item) => item.addressDetails).flat(), [filteredPrivatekeyAccounts]);

  if (filteredMnemonicAccounts.length === 0 && privateKeyAddresses.length === 0) {
    return null;
  }

  return (
    <WrapperContainer>
      {filteredMnemonicAccounts.map((item) => {
        const mnemonicName = mnemonicNamesByHashedMnemonic[item.id];

        const flatAddressDetails = item.accounts.map((item) => item.addressDetails.map((addressDetail) => addressDetail)).flat();

        return (
          <Container key={item.id}>
            <TopContainer>
              <TopLeftContainer>
                <MnemonicIcon />
                <Base1300Text variant="h4_B">{mnemonicName}</Base1300Text>
              </TopLeftContainer>
            </TopContainer>
            <BodyContainer>
              {flatAddressDetails.map((addressDetail, i) => {
                const shortAddress = shorterAddress(addressDetail.address, 20);

                return (
                  <AccountButton
                    key={i}
                    onClick={() => {
                      onClickAddress?.(addressDetail.address);
                    }}
                  >
                    <AccountLeftContainer>
                      <AccountImgContainer />

                      <AccountInfoContainer>
                        <TitleContainer>
                          <Base1300Text
                            variant="b2_M"
                            sx={{
                              height: 'fit-content',
                            }}
                          >
                            {addressDetail.name}
                          </Base1300Text>
                          {addressDetail.badge && (
                            <Badge colorHex={addressDetail.badge.color}>
                              <Base1300Text variant="b4_M">{addressDetail.badge.text}</Base1300Text>
                            </Badge>
                          )}
                        </TitleContainer>
                        <AddressText variant="b4_M">{shortAddress}</AddressText>
                      </AccountInfoContainer>
                    </AccountLeftContainer>
                  </AccountButton>
                );
              })}
            </BodyContainer>
          </Container>
        );
      })}
      {privateKeyAddresses.length > 0 && (
        <>
          <TopContainer>
            <TopLeftContainer>
              <PrivatekeyIcon />
              <Base1300Text variant="h4_B">{t('components.AddressBottomSheet.components.PrivatekeyAccount')}</Base1300Text>
            </TopLeftContainer>
          </TopContainer>
          <BodyContainer>
            {privateKeyAddresses.map((item, i) => {
              return (
                <AccountButton
                  key={i}
                  onClick={() => {
                    onClickAddress?.(item.address);
                  }}
                >
                  <AccountLeftContainer>
                    <AccountImgContainer />

                    <AccountInfoContainer>
                      <TitleContainer>
                        <Base1300Text
                          variant="b2_M"
                          sx={{
                            height: 'fit-content',
                          }}
                        >
                          {item.name}
                        </Base1300Text>
                        {item.badge && (
                          <Badge colorHex={item.badge.color}>
                            <Base1300Text variant="b4_M">{item.badge.text}</Base1300Text>
                          </Badge>
                        )}
                      </TitleContainer>

                      <AddressText variant="b4_M">{shorterAddress(item.address, 20)}</AddressText>
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

function filterMatchingAddresses(addressList: AccountAddress[], chainId: UniqueChainId, filterAddress?: string) {
  const matchingAddresses = addressList
    ?.filter((address) => getUniqueChainIdWithManual(address.chainId, address.chainType) === chainId)
    .filter((item) => {
      const isFilterCurrentAddress = isEqualsIgnoringCase(item.address || '', filterAddress);

      if (isFilterCurrentAddress) {
        return null;
      }

      return true;
    });

  return matchingAddresses;
}

function getBadgeDetail(accountAddress: AccountAddress) {
  if (accountAddress.chainType === 'bitcoin') {
    const pubkeyStyle = accountAddress.accountType.pubkeyStyle;
    if (pubkeyStyle === 'p2tr') {
      return {
        text: 'Taproot',
        color: '#F2C94C',
      };
    }
    if (pubkeyStyle === 'p2wpkh') {
      return {
        text: 'Native Segwit',
        color: '#2D9CDB',
      };
    }
    if (pubkeyStyle === 'p2pkh')
      return {
        text: 'Legacy',
        color: '#EB5757',
      };
    if (pubkeyStyle === 'p2wpkhSh')
      return {
        text: 'Segwit',
        color: '#27AE60',
      };
  }

  if (accountAddress.chainType === 'cosmos') {
    if (accountAddress.accountType.isDefault === false) {
      return {
        text: 'Old',
        color: '#6d5b5b',
      };
    }
  }
  return null;
}
