import type { SuiObjectData, SuiObjectResponse } from '@mysten/sui/client';

import type { SuiNFTMeta } from '@/types/nft';

export function getObjectDisplay(data?: SuiObjectResponse | null) {
  if (data && data.data?.content?.dataType === 'moveObject' && data.data.display) {
    return data.data.display;
  }

  return undefined;
}

export function getNFTType(type?: string | null) {
  return type?.split('::')[2] || '';
}

export function isKiosk(data: SuiObjectData) {
  return !!data.type && data.type.includes('kiosk') && !!data.content && 'fields' in data.content && 'kiosk' in data.content.fields;
}

export function getNFTMeta(data?: SuiObjectResponse): SuiNFTMeta | undefined {
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
  return undefined;
}

export function getObjectOwner(data?: SuiObjectResponse) {
  if (data?.data?.owner) {
    return data.data.owner;
  }
  return undefined;
}
