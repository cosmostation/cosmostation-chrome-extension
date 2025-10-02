import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { getAccount, getAccountAddress, getCustomAccountAddress, getPassword } from '@/libs/account';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import type { AccountAddress } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';
import { devLogger } from '@/utils/devLogger';
import { getExtensionLocalStorage } from '@/utils/storage';

const SEI_CHAIN_CONFIG = {
  hdPath: "m/44'/60'/0'/0/${index}",
  pubkeyStyle: 'secp256k1',
  pubkeyType: '/cosmos.crypto.secp256k1.PubKey',
};

function shouldUseSeiConfig(chainId: string, chainType: string, pubkeyStyle: string): boolean {
  return chainId === 'sei' && chainType === 'cosmos' && pubkeyStyle === 'keccak256';
}

export async function address(id: string) {
  devLogger.time(`address-${id}`);
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
            if (etc.id !== 'sei' && storedAccountAddresses && storedAccountAddresses.length > 0) {
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

              if (existingAddress && existingAddress.accountType.isDefault === accountType.isDefault) {
                return existingAddress;
              }
            }

            const resolvedAccountType = (() => {
              if (shouldUseSeiConfig(etc.id, etc.chainType, accountType.pubkeyStyle)) {
                return SEI_CHAIN_CONFIG;
              } else {
                return accountType;
              }
            })();

            const chainItem = { ...etc, accountTypes: [resolvedAccountType] };

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
      console.error(`address-${id}`, `${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(`address-${id}`, error);
    }
  } finally {
    devLogger.timeEnd(`address-${id}`);
  }
}

export async function customChainAddress(id: string) {
  devLogger.time(`custom-address-${id}`);
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
      console.error(`custom-address-${id}`, `${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(`custom-address-${id}`, error);
    }
  } finally {
    devLogger.timeEnd(`custom-address-${id}`);
  }
}
