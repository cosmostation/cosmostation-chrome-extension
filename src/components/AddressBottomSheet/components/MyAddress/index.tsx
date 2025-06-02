import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import AccountImage from '@/components/AccountImage';
import Base1300Text from '@/components/common/Base1300Text';
import EmptyAsset from '@/components/EmptyAsset';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import type { Account, AccountAddress, ChainToAccountTypeMap } from '@/types/account';
import type { UniqueChainId } from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';
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
  EmptyAssetContainer,
  TitleContainer,
  TopContainer,
  TopLeftContainer,
  WrapperContainer,
} from './styled';

import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
import NoListIcon from '@/assets/images/icons/NoList70.svg';
import PrivatekeyIcon from '@/assets/images/icons/PrivateKey14.svg';

type MnemonicAccountProps = {
  chainId: UniqueChainId;
  filterAddress?: string;
  searchText?: string;
  onClickAddress: (address: string) => void;
};

type AccountAddressDetails = AccountAddress & {
  accountId: string;
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

export default function MnemonicAccount({ chainId, filterAddress, searchText, onClickAddress }: MnemonicAccountProps) {
  const { t } = useTranslation();

  const { userAccounts, accountNamesById, mnemonicNamesByHashedMnemonic } = useExtensionStorageStore((state) => state);
  const { currentPreferAccountType } = useCurrentPreferAccountTypes();
  const accountIds = useMemo(() => userAccounts.map((account) => account.id), [userAccounts]);

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
      userAccounts
        .filter((item) => item.type === 'MNEMONIC')
        .map((account) => account.encryptedRestoreString)
        .filter((value, index, self) => self.indexOf(value) === index),
    [userAccounts],
  );

  const privatekeyAccounts = useMemo(() => userAccounts.filter((item) => item.type === 'PRIVATE_KEY'), [userAccounts]);

  const filteredMnemonicAccounts = useMemo(
    () =>
      uniqueMnemonicRestoreString
        .map((restoreString) => {
          const filteredMnemonicAccounts = userAccounts.filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === restoreString);

          const filteredAccountAddresses = filteredMnemonicAccounts
            .map((item) => {
              const addressList: AccountAddress[] | undefined = addressesMap[item.id];

              const matchingAddresses = filterMatchingAddresses(addressList, chainId, filterAddress, currentPreferAccountType);

              if (!matchingAddresses || matchingAddresses.length === 0) return null;

              const matchingAddressesWithBadge = matchingAddresses.map((addressInfo) => ({
                ...addressInfo,
                name: accountNamesById[item.id],
                accountId: item.id,
              }));

              return {
                addressDetails: matchingAddressesWithBadge,
                account: item,
              };
            })
            .filter((item) => item !== null) as AccountAddressInfo[];

          return {
            id: restoreString,
            mnemonicName: mnemonicNamesByHashedMnemonic[restoreString] || '',
            accounts: filteredAccountAddresses,
          };
        })
        .filter((item) => item.accounts.length > 0),
    [
      uniqueMnemonicRestoreString,
      userAccounts,
      mnemonicNamesByHashedMnemonic,
      addressesMap,
      chainId,
      filterAddress,
      currentPreferAccountType,
      accountNamesById,
    ],
  );

  const filteredMnemonicAccountsBySearch = useMemo(() => {
    if (!searchText) return filteredMnemonicAccounts;

    const filterKeyword = searchText.toLowerCase();

    return filteredMnemonicAccounts
      .map((mnemonicAccount) => {
        const { mnemonicName, accounts, ...rest } = mnemonicAccount;
        const matchesMnemonicName = mnemonicName.toLowerCase().includes(filterKeyword);

        const filteredAccounts = accounts.filter((account) => {
          return account.addressDetails.some((detail) => {
            const condition = [detail.name, detail.address];

            return condition.some((item) => item.toLowerCase().indexOf(filterKeyword) > -1);
          });
        });

        if (matchesMnemonicName || filteredAccounts.length > 0) {
          return {
            ...rest,
            mnemonicName,
            accounts: filteredAccounts.length > 0 ? filteredAccounts : accounts,
          };
        }

        return null;
      })
      .filter((account): account is NonNullable<typeof account> => account !== null);
  }, [filteredMnemonicAccounts, searchText]);

  const filteredPrivatekeyAccounts = useMemo(
    () =>
      privatekeyAccounts
        .map((item) => {
          const addressList: AccountAddress[] | undefined = addressesMap[item.id];

          const matchingAddresses = filterMatchingAddresses(addressList, chainId, filterAddress, currentPreferAccountType);

          if (!matchingAddresses || matchingAddresses.length === 0) return null;

          const matchingAddressesWithBadge = matchingAddresses.map((addressInfo) => ({
            ...addressInfo,
            name: accountNamesById[item.id],
            accountId: item.id,
          }));

          return {
            addressDetails: matchingAddressesWithBadge,
            account: item,
          };
        })
        .filter((item) => item !== null) as AccountAddressInfo[],
    [accountNamesById, addressesMap, chainId, currentPreferAccountType, filterAddress, privatekeyAccounts],
  );

  const privateKeyAddresses = useMemo(() => filteredPrivatekeyAccounts.map((item) => item.addressDetails).flat(), [filteredPrivatekeyAccounts]);

  const filteredPrivateKeyAddresses = useMemo(() => {
    if (!searchText) return privateKeyAddresses;

    const filterKeyword = searchText.toLowerCase();

    return privateKeyAddresses.filter((account) => {
      const condition = [account.name, account.address];

      return condition.some((item) => item.toLowerCase().indexOf(filterKeyword) > -1);
    });
  }, [privateKeyAddresses, searchText]);

  if (filteredMnemonicAccountsBySearch.length === 0 && filteredPrivateKeyAddresses.length === 0) {
    return (
      <EmptyAssetContainer>
        <EmptyAsset
          icon={<NoListIcon />}
          title={t('components.AddressBottomSheet.components.noAccounts')}
          subTitle={t('components.AddressBottomSheet.components.noAccountsDescription')}
        />
      </EmptyAssetContainer>
    );
  }

  return (
    <WrapperContainer>
      {filteredMnemonicAccountsBySearch.map((item) => {
        const flatAddressDetails = item.accounts.flatMap((account) => account.addressDetails);

        return (
          <Container key={item.id}>
            <TopContainer>
              <TopLeftContainer>
                <MnemonicIcon />
                <Base1300Text variant="h4_B">{item.mnemonicName}</Base1300Text>
              </TopLeftContainer>
            </TopContainer>
            <BodyContainer>
              {flatAddressDetails.map((addressDetail, i) => {
                return (
                  <AccountButton
                    key={i}
                    onClick={() => {
                      onClickAddress?.(addressDetail.address);
                    }}
                  >
                    <AccountLeftContainer>
                      <AccountImgContainer>
                        <AccountImage accountId={addressDetail.accountId} />
                      </AccountImgContainer>

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
                        <AddressText variant="b4_M">{addressDetail.address}</AddressText>
                      </AccountInfoContainer>
                    </AccountLeftContainer>
                  </AccountButton>
                );
              })}
            </BodyContainer>
          </Container>
        );
      })}
      {filteredPrivateKeyAddresses.length > 0 && (
        <>
          <TopContainer>
            <TopLeftContainer>
              <PrivatekeyIcon />
              <Base1300Text variant="h4_B">{t('components.AddressBottomSheet.components.PrivatekeyAccount')}</Base1300Text>
            </TopLeftContainer>
          </TopContainer>
          <BodyContainer>
            {filteredPrivateKeyAddresses.map((item, i) => {
              return (
                <AccountButton
                  key={i}
                  onClick={() => {
                    onClickAddress?.(item.address);
                  }}
                >
                  <AccountLeftContainer>
                    <AccountImgContainer>
                      <AccountImage accountId={item.accountId} />
                    </AccountImgContainer>

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

                      <AddressText variant="b4_M">{item.address}</AddressText>
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

function filterMatchingAddresses(
  addressList: AccountAddress[] | undefined,
  chainId: UniqueChainId,
  filterAddress?: string,
  preferAccountType?: ChainToAccountTypeMap,
) {
  return addressList?.filter((address) => {
    const isDifferentChain = getUniqueChainIdWithManual(address.chainId, address.chainType) !== chainId;

    if (isDifferentChain) {
      return false;
    }

    if (preferAccountType) {
      const preferredType = preferAccountType[address.chainId];

      const isDifferentAccountType =
        preferredType && (address.accountType.hdPath !== preferredType.hdPath || address.accountType.pubkeyStyle !== preferredType.pubkeyStyle);

      if (isDifferentAccountType) {
        return false;
      }
    }

    const isSameWithCurrentAddress = isEqualsIgnoringCase(address.address || '', filterAddress);

    return !isSameWithCurrentAddress;
  });
}
