export function toDisplayTokenId(tokenId?: string) {
  if (!tokenId) return '';
  return '#'.concat(tokenId);
}

export function convertIpfs(url?: string) {
  if (!url) return '';
  return url.replace(/^ipfs:\/\// || /^ipfs:\//, 'https://ipfs.io/ipfs/');
}
