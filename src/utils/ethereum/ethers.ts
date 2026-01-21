import type { JsonRpcApiProviderOptions, Networkish } from 'ethers';
import { ethers, FetchRequest } from 'ethers';

export function ethersProvider(rpcURL: string, network?: Networkish, options?: JsonRpcApiProviderOptions) {
  const customFetchRequest = new FetchRequest(rpcURL);

  customFetchRequest.setHeader('Cosmostation', `extension/${__APP_VERSION__}`);

  return new ethers.JsonRpcProvider(customFetchRequest, network, options);
}
