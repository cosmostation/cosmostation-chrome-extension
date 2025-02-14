import { ethers, FetchRequest } from 'ethers';

export function ethersProvider(rpcURL: string) {
  const customFetchRequest = new FetchRequest(rpcURL);

  customFetchRequest.setHeader('Cosmostation', `extension/${__APP_MODE__}`);

  return new ethers.JsonRpcProvider(customFetchRequest);
}
