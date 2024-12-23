import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { getAccount, getAccountAddress, getPassword } from '@/libs/account';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import type { AccountAddress } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';

export async function address(id: string) {
  console.time(`address-${id}`);
  try {
    const account = await getAccount(id);
    const { cosmosChains, evmChains, suiChains, aptosChains } = await getChains();

    const password = await getPassword();

    const chains = [...cosmosChains, ...evmChains, ...suiChains, ...aptosChains];

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
              const existingAddress = storedAccountAddresses.find(
                (storedAddress) =>
                  storedAddress.chainId === etc.id &&
                  storedAddress.chainType === etc.chainType &&
                  storedAddress.accountType.hdPath === accountType.hdPath &&
                  storedAddress.accountType.pubKeyType === accountType.pubKeyType,
              );

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
