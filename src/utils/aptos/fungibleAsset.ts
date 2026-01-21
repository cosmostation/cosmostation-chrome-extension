import { isHexString } from 'ethers';

export function isFungibleAssetMetadataId(id?: string) {
  return !!id && !id.includes('::') && isHexString(id);
}
