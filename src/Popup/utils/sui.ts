import type { SuiObjectData, SuiObjectResponse } from '@mysten/sui/client';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { extensionStorage } from '~/Popup/utils/extensionStorage';
import type { SuiNFTMeta } from '~/types/nft/nftMeta';
import type { GetObject, GetObjectExists, Result } from '~/types/sui/rpc';

import { SuiRPCError } from './error';

export function getAddress(publicKey: Buffer) {
  const key = new Ed25519PublicKey(publicKey);

  return key.toSuiAddress();
}

export function isExists(object: Result<GetObject>): object is Result<GetObjectExists> {
  return object.result?.status === 'Exists';
}

export function getCoinType(type?: string | null) {
  if (!type || type?.split('::')[1] !== 'coin') {
    return '';
  }

  const startIndex = type.indexOf('<');
  const endIndex = type.indexOf('>');

  if (startIndex > -1 && endIndex > -1) {
    return type.substring(startIndex + 1, endIndex);
  }

  return '';
}

export function getNFTType(type?: string | null) {
  return type?.split('::')[2] || '';
}

export function isKiosk(data: SuiObjectData) {
  return !!data.type && data.type.includes('kiosk') && !!data.content && 'fields' in data.content && 'kiosk' in data.content.fields;
}

export function getNFTMeta(data?: SuiObjectResponse): SuiNFTMeta {
  if (data && data.data?.content?.dataType === 'moveObject') {
    const { name, description, creator, image_url, link, project_url } = getObjectDisplay(data)?.data || {};

    const objectOwner = getObjectOwner(data);
    return {
      name: name || '',
      description: description || '',
      imageURL: image_url || '',
      link: link || '',
      projectUrl: project_url || '',
      creator: creator || '',
      objectId: data.data.objectId || '',
      ownerAddress:
        objectOwner && objectOwner !== 'Immutable' && 'AddressOwner' in objectOwner
          ? objectOwner.AddressOwner
          : objectOwner && objectOwner !== 'Immutable' && 'ObjectOwner' in objectOwner
          ? objectOwner.ObjectOwner
          : '',
      objectFieldData: { ...data.data?.content.fields },
      type: data.data.type || '',
      rarity: '',
    };
  }
  return {};
}

export function getObjectOwner(data?: SuiObjectResponse) {
  if (data?.data?.owner) {
    return data.data.owner;
  }
  return undefined;
}

export function getObjectDisplay(data?: SuiObjectResponse | null) {
  if (data && data.data?.content?.dataType === 'moveObject' && data.data.display) {
    return data.data.display;
  }

  return undefined;
}

export async function requestRPC<T>(method: string, params: unknown, id?: string | number, url?: string) {
  const { currentSuiNetwork } = await extensionStorage();

  const rpcURL = url ?? currentSuiNetwork.rpcURL;

  const rpcId = id ?? new Date().getTime();

  try {
    const response = await fetch(rpcURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cosmostation: `extension/${String(process.env.VERSION)}`,
      },
      body: JSON.stringify({ method, params, jsonrpc: '2.0', id: rpcId }),
    });

    const responseJSON = (await response.json()) as { id?: number | string };

    if (id === undefined) {
      delete responseJSON?.id;
    }

    return responseJSON as unknown as T;
  } catch {
    throw new SuiRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], rpcId);
  }
}
