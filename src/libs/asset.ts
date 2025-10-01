import type { DynamicFieldInfo as IotaDynamicFieldInfo, IotaObjectDataOptions, IotaObjectResponse, IotaObjectResponseQuery } from '@iota/iota-sdk/client';
import { IotaClient, Network as IotaNetwork } from '@iota/iota-sdk/client';
import { KioskClient as IotaKioskClient } from '@iota/kiosk';
import { KioskClient, Network } from '@mysten/kiosk';
import type { DynamicFieldInfo, SuiObjectDataOptions, SuiObjectResponse, SuiObjectResponseQuery } from '@mysten/sui/client';
import { SuiClient } from '@mysten/sui/client';
import PromisePool from '@supercharge/promise-pool';

import type { AssetId } from '@/types/asset';
import type { ExtensionStorage } from '@/types/extension';
import type { IotaGetDynamicFieldsResponse, IotaGetObjectsOwnedByAddressResponse, IotaGetObjectsResponse } from '@/types/iota/api';
import type { SuiGetDynamicFieldsResponse, SuiGetObjectsOwnedByAddressResponse, SuiGetObjectsResponse } from '@/types/sui/api';
import { chunkArray } from '@/utils/array';
import { post } from '@/utils/axios';
import { getObjectDisplay as getIotaObjectDisplay, isKiosk as isIotaKiosk } from '@/utils/iota/nft';
import { getCoinId, getCoinIdWithManual } from '@/utils/queryParamGenerator';
import { getObjectDisplay, isKiosk } from '@/utils/sui/nft';

import { getAccountAddress } from './account';
import { getChains } from './chain';

export async function getHiddenAssets(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-hidden-assetIds`);

  const hiddenAssetIds = storage[`${id}-hidden-assetIds`];

  return hiddenAssetIds ?? [];
}

export async function updateHiddenAssets(id: string, hiddenAssetIds: AssetId[]) {
  const storedHiddenAssetIds = await getHiddenAssets(id);

  const filteredStoredHiddenAssetIds = storedHiddenAssetIds.filter(
    (storedHiddenAssetId) => !hiddenAssetIds.find((hiddenAssetId) => getCoinIdWithManual(storedHiddenAssetId) === getCoinIdWithManual(hiddenAssetId)),
  );

  const updatedHiddenAssetIds = [...filteredStoredHiddenAssetIds, ...hiddenAssetIds];

  await chrome.storage.local.set({ [`${id}-hidden-assetIds`]: updatedHiddenAssetIds });
}

export async function getHiddenCustomAssets() {
  const storage = await chrome.storage.local.get<ExtensionStorage>('customHiddenAssetIds');

  const hiddenCustomAssetIds = storage['customHiddenAssetIds'];

  return hiddenCustomAssetIds ?? [];
}

export async function getHiddenCustomAssetsSet(): Promise<Set<string>> {
  const hiddenCustomAssetIds = await getHiddenCustomAssets();

  const hiddenCustomAssetSet = new Set(hiddenCustomAssetIds.map((item) => getCoinId(item)));

  return hiddenCustomAssetSet;
}

export async function getVisibleAssets(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-visible-assetIds`);

  const visibleAssetIds = storage[`${id}-visible-assetIds`];

  return visibleAssetIds ?? [];
}

type GetSuiNFTSOption = {
  objectResponseQuery?: SuiObjectResponseQuery;
};

export async function getSuiNFTs(id: string, option?: GetSuiNFTSOption) {
  const concurrency = 10;

  const { suiChains } = await getChains();

  const accountAddress = await getAccountAddress(id);

  const suiAddresses = accountAddress.filter((address) => address.chainType === 'sui');

  const addressWithChain = suiAddresses
    .map((addr) => {
      const chain = suiChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(concurrency)
    .for(addressWithChain)
    .process(async (addr) => {
      try {
        const { chainId, chainType, address, chain } = addr;

        const normalNFTObjects = await (async () => {
          const objectsOwnedByAddress = await getObjectsByOwnedAddress(address, chain.id, chainType, option?.objectResponseQuery);

          const objectIdList = objectsOwnedByAddress.map((object) => object.data?.objectId || '');

          const objects = await getMultiObjects(objectIdList, chain.id, chainType, option?.objectResponseQuery?.options);

          const nftObjects = objects?.filter((item) => getObjectDisplay(item)?.data) || [];

          return nftObjects;
        })();

        const anotherKioskObjects = await (async () => {
          const anotherkioskObjects = normalNFTObjects.filter((item) => item.data && isKiosk(item.data));

          const kioskObjectParentId = anotherkioskObjects
            ? anotherkioskObjects.map((item) => getObjectDisplay(item)?.data?.kiosk || '').filter((item) => !!item)
            : [];

          const dynamicFields = await Promise.all(
            kioskObjectParentId.map(async (kioskId) => {
              return await getSuiDynamicFields(kioskId, chainId, chainType);
            }),
          );
          const flatDynamicFields = dynamicFields.flat();

          const kioskDynamicFieldsObjectIds = flatDynamicFields?.map((item) => item.objectId) || [];

          const kioskObjects = await getMultiObjects(kioskDynamicFieldsObjectIds, chainId, chainType, option?.objectResponseQuery?.options);
          const filteredKioskObjects = kioskObjects.filter((item) => getObjectDisplay(item)?.data);

          return filteredKioskObjects;
        })();

        const kioskNFTs = await getSuiKioskNFTs(address, chainId, chainType, option?.objectResponseQuery);

        const total = [...normalNFTObjects, ...kioskNFTs, ...anotherKioskObjects];

        const result = { accountId: id, chainId, chainType, address, nftObjects: total };

        return result;
      } catch {
        return null;
      }
    });

  return results.filter((result) => !!result);
}

export async function getSuiKioskNFTs(address: string, chainId: string, chainType: string, option?: SuiObjectResponseQuery) {
  const { suiChains } = await getChains();
  const suiChain = suiChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!suiChain) throw new Error('Chain not found');

  const rpcUrls = suiChain.rpcUrls.map((rpcUrl) => rpcUrl.url);

  for (const rpcUrl of rpcUrls) {
    try {
      const suiClient = new SuiClient({ url: rpcUrl });
      const network = suiChain.isTestnet ? Network.TESTNET : Network.MAINNET;
      const kioskClient = new KioskClient({ client: suiClient, network });
      const { kioskIds } = await kioskClient.getOwnedKiosks({ address });

      const kioskDatas = await Promise.all(
        kioskIds.map(async (id) => {
          return kioskClient.getKiosk({
            id,
            options: { withKioskFields: true, withListingPrices: true },
          });
        }),
      );

      const kioskObjectIds = kioskDatas.flatMap((kiosk) => kiosk.itemIds);

      const kioskNFTObjects = await getMultiObjects(kioskObjectIds, chainId, chainType, option?.options);

      const filteredKioskNFTs = kioskNFTObjects.filter((item) => !!item && !!getObjectDisplay(item)?.data) || [];

      return filteredKioskNFTs;
    } catch {
      continue;
    }
  }
  return [];
}

export async function getSuiDynamicFields(parentObjectId: string, chainId: string, chainType: string) {
  const { suiChains } = await getChains();
  const suiChain = suiChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!suiChain) throw new Error('Chain not found');

  const rpcUrls = suiChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  let nextKey: string | null = null;
  const dynamicFieldsInfoResponse: DynamicFieldInfo[][] = [];

  do {
    for (const rpcUrl of rpcUrls) {
      try {
        const response: SuiGetDynamicFieldsResponse | undefined = await post<SuiGetDynamicFieldsResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'suix_getDynamicFields',
          params: [parentObjectId, nextKey, null],
          id: parentObjectId,
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: suix_getDynamicFields, Message: ${response.error?.message}`);
        }
        if (response.result) {
          nextKey = response.result.nextCursor && response.result.hasNextPage ? response.result.nextCursor : null;
          dynamicFieldsInfoResponse.push(response.result.data ?? []);
          break;
        }
      } catch {
        continue;
      }
    }
  } while (nextKey);

  return dynamicFieldsInfoResponse.flat();
}

export async function getObjectsByOwnedAddress(
  address: string,
  chainId: string,
  chainType: string,
  option?: SuiObjectResponseQuery,
): Promise<SuiObjectResponse[]> {
  const { suiChains } = await getChains();
  const suiChain = suiChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!suiChain) throw new Error('Chain not found');

  const rpcUrls = suiChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  let nextKey: string | null = null;
  const suiObjectResponses: SuiObjectResponse[][] = [];

  do {
    let success = false;
    for (const rpcUrl of rpcUrls) {
      try {
        const response: SuiGetObjectsOwnedByAddressResponse | undefined = await post<SuiGetObjectsOwnedByAddressResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'suix_getOwnedObjects',
          params: nextKey ? [address, { ...option }, nextKey] : [address, { ...option }],
          id: address,
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: suix_getOwnedObjects, Message: ${response.error?.message}`);
        }

        if (response.result) {
          nextKey = response.result.nextCursor && response.result.hasNextPage ? response.result.nextCursor : null;
          suiObjectResponses.push(response.result.data ?? []);
          success = true;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!success) break;
  } while (nextKey);

  return suiObjectResponses.flat();
}

export async function getMultiObjects(
  objectIds: string[],
  chainId: string,
  chainType: string,
  option?: SuiObjectDataOptions | null,
): Promise<SuiObjectResponse[]> {
  const { suiChains } = await getChains();
  const suiChain = suiChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!suiChain) throw new Error('Chain not found');

  const rpcUrls = suiChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  const chunkedArray = chunkArray(objectIds, 50);
  const multiGetObjectResponses: SuiObjectResponse[][] = [];

  for (const chunk of chunkedArray) {
    let success = false;
    for (const rpcUrl of rpcUrls) {
      try {
        const response = await post<SuiGetObjectsResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'sui_multiGetObjects',
          params: [
            [...chunk],
            {
              ...option,
              showType: true,
              showContent: true,
              showOwner: true,
              showDisplay: true,
            },
          ],
          id: 'getMultiObjects',
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: sui_multiGetObjects, Message: ${response.error?.message}`);
        }

        if (response.result) {
          multiGetObjectResponses.push(response.result ?? []);
          success = true;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!success) break;
  }

  return multiGetObjectResponses.flat();
}

type GetIotaNFTSOption = {
  objectResponseQuery?: IotaObjectResponseQuery;
};

export async function getIotaNFTs(id: string, option?: GetIotaNFTSOption) {
  const concurrency = 10;

  const { iotaChains } = await getChains();

  const accountAddress = await getAccountAddress(id);

  const iotaAddresses = accountAddress.filter((address) => address.chainType === 'iota');

  const addressWithChain = iotaAddresses
    .map((addr) => {
      const chain = iotaChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(concurrency)
    .for(addressWithChain)
    .process(async (addr) => {
      try {
        const { chainId, chainType, address, chain } = addr;

        const normalNFTObjects = await (async () => {
          const objectsOwnedByAddress = await getIotaObjectsByOwnedAddress(address, chain.id, chainType, option?.objectResponseQuery);

          const objectIdList = objectsOwnedByAddress.map((object) => object.data?.objectId || '');

          const objects = await getIotaMultiObjects(objectIdList, chain.id, chainType, option?.objectResponseQuery?.options);

          const nftObjects = objects?.filter((item) => getIotaObjectDisplay(item)?.data) || [];

          return nftObjects;
        })();

        const anotherKioskObjects = await (async () => {
          const anotherkioskObjects = normalNFTObjects.filter((item) => item.data && isIotaKiosk(item.data));

          const kioskObjectParentId = anotherkioskObjects
            ? anotherkioskObjects.map((item) => getIotaObjectDisplay(item)?.data?.kiosk || '').filter((item) => !!item)
            : [];

          const dynamicFields = await Promise.all(
            kioskObjectParentId.map(async (kioskId) => {
              return await getIotaDynamicFields(kioskId, chainId, chainType);
            }),
          );
          const flatDynamicFields = dynamicFields.flat();

          const kioskDynamicFieldsObjectIds = flatDynamicFields?.map((item) => item.objectId) || [];

          const kioskObjects = await getIotaMultiObjects(kioskDynamicFieldsObjectIds, chainId, chainType, option?.objectResponseQuery?.options);
          const filteredKioskObjects = kioskObjects.filter((item) => getIotaObjectDisplay(item)?.data);

          return filteredKioskObjects;
        })();

        const kioskNFTs = await getIotaKioskNFTs(address, chainId, chainType, option?.objectResponseQuery);

        const total = [...normalNFTObjects, ...kioskNFTs, ...anotherKioskObjects];

        const result = { accountId: id, chainId, chainType, address, nftObjects: total };

        return result;
      } catch {
        return null;
      }
    });

  return results.filter((result) => !!result);
}

export async function getIotaKioskNFTs(address: string, chainId: string, chainType: string, option?: IotaObjectResponseQuery) {
  const { iotaChains } = await getChains();
  const iotaChain = iotaChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!iotaChain) throw new Error('Chain not found');

  const rpcUrls = iotaChain.rpcUrls.map((rpcUrl) => rpcUrl.url);

  for (const rpcUrl of rpcUrls) {
    try {
      const iotaClient = new IotaClient({ url: rpcUrl });
      const network = iotaChain.isTestnet ? IotaNetwork.Testnet : IotaNetwork.Mainnet;
      const kioskClient = new IotaKioskClient({ client: iotaClient, network });
      const { kioskIds } = await kioskClient.getOwnedKiosks({ address });

      const kioskDatas = await Promise.all(
        kioskIds.map(async (id) => {
          return kioskClient.getKiosk({
            id,
            options: { withKioskFields: true, withListingPrices: true },
          });
        }),
      );

      const kioskObjectIds = kioskDatas.flatMap((kiosk) => kiosk.itemIds);

      const kioskNFTObjects = await getIotaMultiObjects(kioskObjectIds, chainId, chainType, option?.options);

      const filteredKioskNFTs = kioskNFTObjects.filter((item) => !!item && !!getIotaObjectDisplay(item)?.data) || [];

      return filteredKioskNFTs;
    } catch {
      continue;
    }
  }
  return [];
}

export async function getIotaDynamicFields(parentObjectId: string, chainId: string, chainType: string) {
  const { iotaChains } = await getChains();
  const iotaChain = iotaChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!iotaChain) throw new Error('Chain not found');

  const rpcUrls = iotaChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  let nextKey: string | null = null;
  const dynamicFieldsInfoResponse: IotaDynamicFieldInfo[][] = [];

  do {
    for (const rpcUrl of rpcUrls) {
      try {
        const response: IotaGetDynamicFieldsResponse | undefined = await post<IotaGetDynamicFieldsResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'iotax_getDynamicFields',
          params: [parentObjectId, nextKey, null],
          id: parentObjectId,
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: iotax_getDynamicFields, Message: ${response.error?.message}`);
        }
        if (response.result) {
          nextKey = response.result.nextCursor && response.result.hasNextPage ? response.result.nextCursor : null;
          dynamicFieldsInfoResponse.push(response.result.data ?? []);
          break;
        }
      } catch {
        continue;
      }
    }
  } while (nextKey);

  return dynamicFieldsInfoResponse.flat();
}

export async function getIotaObjectsByOwnedAddress(
  address: string,
  chainId: string,
  chainType: string,
  option?: IotaObjectResponseQuery,
): Promise<IotaObjectResponse[]> {
  const { iotaChains } = await getChains();
  const iotaChain = iotaChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!iotaChain) throw new Error('Chain not found');

  const rpcUrls = iotaChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  let nextKey: string | null = null;
  const iotaObjectResponses: IotaObjectResponse[][] = [];

  do {
    let success = false;
    for (const rpcUrl of rpcUrls) {
      try {
        const response: IotaGetObjectsOwnedByAddressResponse | undefined = await post<IotaGetObjectsOwnedByAddressResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'iotax_getOwnedObjects',
          params: nextKey ? [address, { ...option }, nextKey] : [address, { ...option }],
          id: address,
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: iotax_getOwnedObjects, Message: ${response.error?.message}`);
        }

        if (response.result) {
          nextKey = response.result.nextCursor && response.result.hasNextPage ? response.result.nextCursor : null;
          iotaObjectResponses.push(response.result.data ?? []);
          success = true;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!success) break;
  } while (nextKey);

  return iotaObjectResponses.flat();
}

export async function getIotaMultiObjects(
  objectIds: string[],
  chainId: string,
  chainType: string,
  option?: IotaObjectDataOptions | null,
): Promise<IotaObjectResponse[]> {
  const { iotaChains } = await getChains();
  const iotaChain = iotaChains.find((chain) => chain.chainType === chainType && chain.id === chainId);
  if (!iotaChain) throw new Error('Chain not found');

  const rpcUrls = iotaChain.rpcUrls.map((rpcUrl) => rpcUrl.url);
  const chunkedArray = chunkArray(objectIds, 50);
  const multiGetObjectResponses: IotaObjectResponse[][] = [];

  for (const chunk of chunkedArray) {
    let success = false;
    for (const rpcUrl of rpcUrls) {
      try {
        const response = await post<IotaGetObjectsResponse>(rpcUrl, {
          jsonrpc: '2.0',
          method: 'iota_multiGetObjects',
          params: [
            [...chunk],
            {
              ...option,
              showType: true,
              showContent: true,
              showOwner: true,
              showDisplay: true,
            },
          ],
          id: 'getMultiObjects',
        });
        if (response.error) {
          throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: iota_multiGetObjects, Message: ${response.error?.message}`);
        }

        if (response.result) {
          multiGetObjectResponses.push(response.result ?? []);
          success = true;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!success) break;
  }

  return multiGetObjectResponses.flat();
}

// 장난감
