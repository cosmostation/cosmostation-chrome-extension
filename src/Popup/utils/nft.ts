import Axios from 'axios';

export function toDisplayTokenId(tokenId?: string) {
  if (!tokenId) return '';

  return tokenId.charAt(0) === '#' ? tokenId : '#'.concat(tokenId);
}

export function convertIpfs(url?: string) {
  if (!url) return '';
  return url.replace(/^ipfs:\/\// || /^ipfs:\//, 'https://ipfs.io/ipfs/');
}

export function concatJsonFileType(url?: string) {
  if (!url) return '';
  return url.endsWith('.json') ? url : url.concat('.json');
}

const baseIpfsURL = 'https://ipfs.io/ipfs/';

const axios = Axios.create({ baseURL: baseIpfsURL });

export function getIpfsCID(ipfsUrl?: string) {
  if (!ipfsUrl) return '';
  return ipfsUrl.replace(/^ipfs:\/\// || /^ipfs:\//, '');
}

export function isIpfsUrl(url?: string) {
  if (!url) return false;
  return url.startsWith('ipfs://') || url.startsWith('ipfs:/');
}

export async function getIpfsData(CID: string): Promise<{ imageURL: string; metaData?: Record<string, unknown> } | null> {
  try {
    let response = await axios.get<Record<string, unknown>>(CID, { validateStatus: (status) => status < 500 });

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
      imageURL:
        typeof response.data.image === 'string'
          ? isIpfsUrl(response.data.image)
            ? `${baseIpfsURL}${getIpfsCID(response.data.image)}`
            : response.data.image
          : '',
      metaData: response.data ?? undefined,
    };
  } catch {
    return null;
  }
}
