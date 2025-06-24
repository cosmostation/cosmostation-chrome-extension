import { GRAVITY_BRDIGE_CHAINLIST_ID, KAVA_CHAINLIST_ID } from '@/constants/cosmos/chain';

import { buildRequestUrl } from '../fetch';
import { toBase64 } from '../string';

export function cosmosURL(lcdURL: string, chainId: string) {
  return {
    getNodeInfo: () => buildRequestUrl(lcdURL, `/cosmos/base/tendermint/v1beta1/node_info`),
    getBalance: (address: string) => buildRequestUrl(lcdURL, `/cosmos/bank/v1beta1/balances/${address}?pagination.limit=10000`),
    getDelegations: (address: string) => buildRequestUrl(lcdURL, `/cosmos/staking/v1beta1/delegations/${address}`),
    getRewards: (address: string) => buildRequestUrl(lcdURL, `/cosmos/distribution/v1beta1/delegators/${address}/rewards`),
    getUndelegations: (address: string) => buildRequestUrl(lcdURL, `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`),
    getAccount: (address: string) => buildRequestUrl(lcdURL, `/cosmos/auth/v1beta1/accounts/${address}`),
    getIncentive: (address: string) => (chainId === KAVA_CHAINLIST_ID ? buildRequestUrl(lcdURL, `/kava/incentive/v1beta1/rewards?owner=${address}`) : ''),
    postBroadcast: () => buildRequestUrl(lcdURL, `/cosmos/tx/v1beta1/txs`),
    getCW20TokenInfo: (contractAddress: string) =>
      buildRequestUrl(lcdURL, `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodeURIComponent(toBase64('{"token_info":{}}'))}`),
    getCW20Balance: (contractAddress: string, address: string) =>
      buildRequestUrl(lcdURL, `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodeURIComponent(toBase64(`{"balance":{"address":"${address}"}}`))}`),
    getCW721NFTInfo: (contractAddress: string, tokenId: string) =>
      buildRequestUrl(lcdURL, `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodeURIComponent(toBase64(`{"nft_info":{"token_id":"${tokenId}"}}`))}`),
    getCW721NFTIds: (contractAddress: string, ownerAddress: string, limit = 50) =>
      buildRequestUrl(
        lcdURL,
        `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodeURIComponent(toBase64(`{"tokens":{"owner":"${ownerAddress}","limit":${limit},"start_after":"0"}}`))}`,
      ),
    getCW721ContractInfo: (contractAddress: string) =>
      buildRequestUrl(lcdURL, `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodeURIComponent(toBase64('{"contract_info":{}}'))}`),
    getCW721NumTokens: (contractAddress: string) =>
      buildRequestUrl(lcdURL, `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodeURIComponent(toBase64('{"num_tokens":{}}'))}`),
    getCW721CollectionInfo: (contractAddress: string) =>
      buildRequestUrl(lcdURL, `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodeURIComponent(toBase64('{"collection_info":{}}'))}`),
    getClientState: (channelId: string, port?: string) =>
      buildRequestUrl(lcdURL, `/ibc/core/channel/v1/channels/${channelId}/ports/${port || 'transfer'}/client_state`),
    simulate: () => buildRequestUrl(lcdURL, `/cosmos/tx/v1beta1/simulate`),
    getTxInfo: (txHash: string) => buildRequestUrl(lcdURL, `/cosmos/tx/v1beta1/txs/${txHash}`),
    getBlockLatest: () =>
      chainId === GRAVITY_BRDIGE_CHAINLIST_ID
        ? buildRequestUrl(lcdURL, `/blocks/latest`)
        : buildRequestUrl(lcdURL, `/cosmos/base/tendermint/v1beta1/blocks/latest`),
    getCommission: (validatorAddress: string) => buildRequestUrl(lcdURL, `/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`),
    getFeemarket: (denom?: string) => buildRequestUrl(lcdURL, `/feemarket/v1/gas_prices${denom ? `/${denom}` : ''}`),
    getValidators: () => buildRequestUrl(lcdURL, `/cosmos/staking/v1beta1/validators?pagination.limit=10000`),
    getNTRNRewards: (contractAddress: string, address: string) =>
      buildRequestUrl(lcdURL, `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodeURIComponent(toBase64(`{"rewards":{"user":"${address}"}}`))}`),
  };
}
