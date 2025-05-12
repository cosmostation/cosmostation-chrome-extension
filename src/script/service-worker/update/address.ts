import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { getAccount, getAccountAddress, getCustomAccountAddress, getPassword } from '@/libs/account';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import type { AccountAddress } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';
import { getExtensionLocalStorage } from '@/utils/storage';

export async function address(id: string) {
  console.time(`address-${id}`);
  try {
    const account = await getAccount(id);
    const { cosmosChains, evmChains, suiChains, aptosChains, bitcoinChains, iotaChains } = await getChains();

    const password = await getPassword();

    const chains = [...cosmosChains, ...evmChains, ...suiChains, ...aptosChains, ...bitcoinChains, ...iotaChains];

    const storedAccountAddresses = await getAccountAddress(id);

    const { results: addressResponse } = await PromisePool.withConcurrency(100)
      .for(chains)
      .handleError((error) => {
        throw error;
      })
      .process(async (c) => {
        const { accountTypes, ...etc } = c;

        const { results: addresses } = await PromisePool.withConcurrency(100)
          .for(accountTypes)
          .handleError((error) => {
            throw error;
          })
          .process(async (accountType) => {
            if (storedAccountAddresses && storedAccountAddresses.length > 0) {
              const existingAddress = storedAccountAddresses.find((storedAddress) => {
                const isSamePubkeyType = (() => {
                  if (storedAddress.accountType.pubkeyType && accountType.pubkeyType) {
                    return storedAddress.accountType.pubkeyType === accountType.pubkeyType;
                  }
                  return true;
                })();

                return (
                  storedAddress.chainId === etc.id &&
                  storedAddress.chainType === etc.chainType &&
                  storedAddress.accountType.hdPath === accountType.hdPath &&
                  isSamePubkeyType
                );
              });

              if (existingAddress) {
                return existingAddress;
              }
            }

            const chainItem = { ...etc, accountTypes: [accountType] };
            const keypair = getKeypair(chainItem, account, password);
            const address = getAddress(chainItem, keypair.publicKey);

            const result: AccountAddress = { chainId: etc.id, chainType: etc.chainType, address, publicKey: keypair.publicKey, accountType };

            return result;
          });

        return addresses;
      });

    const addresses = addressResponse.flat();
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-address`>>({ [`${account.id}-address`]: addresses });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`address-${id}`, `${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(`address-${id}`, error);
    }
  } finally {
    console.timeEnd(`address-${id}`);
  }
}

export async function customChainAddress(id: string) {
  console.time(`custom-address-${id}`);
  try {
    const account = await getAccount(id);
    const addedCustomChains = await getExtensionLocalStorage('addedCustomChainList');

    const password = await getPassword();

    const storedCustomAccountAddresses = await getCustomAccountAddress(id);

    const { results: addressResponse } = await PromisePool.withConcurrency(100)
      .for(addedCustomChains)
      .handleError((error) => {
        throw error;
      })
      .process(async (c) => {
        const { accountTypes, ...etc } = c;

        const primaryAccountType = accountTypes[0];

        if (storedCustomAccountAddresses && storedCustomAccountAddresses.length > 0) {
          const existingAddress = storedCustomAccountAddresses.find(
            (storedAddress) =>
              storedAddress.chainId === etc.id &&
              storedAddress.chainType === etc.chainType &&
              storedAddress.accountType.hdPath === primaryAccountType.hdPath &&
              storedAddress.accountType.pubkeyType === primaryAccountType.pubkeyType,
          );

          if (existingAddress) {
            return existingAddress;
          }
        }

        const chainItem = { ...etc, accountTypes: [primaryAccountType] };
        const keypair = getKeypair(chainItem, account, password);
        const address = getAddress(chainItem, keypair.publicKey);

        const result: AccountAddress = { chainId: etc.id, chainType: etc.chainType, address, publicKey: keypair.publicKey, accountType: primaryAccountType };

        return result;
      });

    const addresses = addressResponse.flat();
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-address`>>({ [`${account.id}-custom-address`]: addresses });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`custom-address-${id}`, `${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(`custom-address-${id}`, error);
    }
  } finally {
    console.timeEnd(`custom-address-${id}`);
  }
}
