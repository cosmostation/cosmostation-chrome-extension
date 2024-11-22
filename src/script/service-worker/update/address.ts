import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { getAccount } from '@/libs/account';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import type { AccountAddress } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';

export async function address(id: string) {
  console.time(`address-${id}`);
  try {
    const account = await getAccount(id);
    const { cosmosChains, evmChains, suiChains, aptosChains } = await getChains();
    const chains = [...cosmosChains, ...evmChains, ...suiChains, ...aptosChains];

    const { results: addressResponse } = await PromisePool.withConcurrency(100)
      .for(chains)
      .handleError((error) => {
        throw error;
      })
      .process(async (c) => {
        // TODO: 기존에 있는지 확인하고 있으면 넘어가기
        const { accountTypes, ...etc } = c;

        const { results: addresses } = await PromisePool.withConcurrency(100)
          .for(accountTypes)
          .handleError((error) => {
            throw error;
          })
          .process(async (accountType) => {
            const chainItem = { ...etc, accountTypes: [accountType] };
            const keypair = getKeypair(chainItem, account);
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
