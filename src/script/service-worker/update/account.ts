import axios from 'axios';

import { KAVA_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { getAccount, getAccountAddress } from '@/libs/account';
import { getChains } from '@/libs/chain';
import type { AccountAddressAccountInfoCosmos } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';
import { fetchCosmosAccountInfo } from '@/utils/cosmos/fetch/accountInfo';

const vestingChainIds = new Set([KAVA_CHAINLIST_ID]);

export async function updateAccountInfo(id: string) {
  console.time(`update-cosmos-account-${id}`);
  try {
    await getAccount(id);

    await Promise.all([cosmosAccountInfo(id)]);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`update-account-info-${id}`);
  }
}

async function cosmosAccountInfo(id: string) {
  const address = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const addressList = address.filter((addr) => vestingChainIds.has(addr.chainId));
  const addressWithChain = addressList
    .map((addr) => {
      const chain = cosmosChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const results = await Promise.all(
    addressWithChain.map(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;

      try {
        const accountInfo = await fetchCosmosAccountInfo(address, lcdUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressAccountInfoCosmos = { id, chainId, chainType, address, accountInfo };

        return result;
      } catch {
        return undefined;
      }
    }),
  );

  const fillteredResults = results.filter((item) => !!item);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-account-info-cosmos`>>({ [`${id}-account-info-cosmos`]: fillteredResults });
}
