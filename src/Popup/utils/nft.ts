import Axios from 'axios';

import type { NFTMetaPayload } from '~/types/cosmos/nft';

export function toDisplayTokenId(tokenId?: string) {
  if (!tokenId) return '';

  return tokenId.charAt(0) === '#' ? tokenId : '#'.concat(tokenId);
}

export function convertIpfs(url?: string) {
  if (!url) return '';
  return url.replace(/^ipfs:\/\/?/, 'https://ipfs.io/ipfs/');
}

export function concatJsonFileType(url?: string) {
  if (!url) return '';
  return url.endsWith('.json') ? url : url.concat('.json');
}

const baseIpfsURL = 'https://ipfs.io/ipfs/';

const axios = Axios.create({ baseURL: baseIpfsURL });

export function getIpfsCID(ipfsUrl?: string) {
  if (!ipfsUrl) return '';
  return ipfsUrl.replace(/^ipfs:\/\/?/, '');
}

export function isIpfsUrl(url?: string) {
  if (!url) return false;
  return url.startsWith('ipfs://') || url.startsWith('ipfs:/');
}

export async function getIpfsData(ipfsURL: string): Promise<{
  imageURL: string;
  metaData?: NFTMetaPayload;
} | null> {
  try {
    const CID = getIpfsCID(ipfsURL);

    let response = await axios.get<NFTMetaPayload>(CID, { validateStatus: (status) => status < 500 });

    if (response.status === 404 && !CID.endsWith('.json')) {
      response = await axios.get(`${CID}.json`);
    }

    if (response.status >= 400) {
      return null;
    }

    const isImage = response.headers['content-type'].startsWith('image');

    if (isImage) {
      return {
        imageURL: `${baseIpfsURL}${CID}`,
        metaData: undefined,
      };
    }

    return {
      imageURL: typeof response.data.image === 'string' ? convertToBaseIpfsUrl(response.data.image) : '',
      metaData: response.data ?? undefined,
    };
  } catch {
    return null;
  }
}

export function convertToBaseIpfsUrl(imageURL?: string) {
  return isIpfsUrl(imageURL) ? `${baseIpfsURL}${getIpfsCID(imageURL)}` : imageURL || '';
}
