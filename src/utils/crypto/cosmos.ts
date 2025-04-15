import { GRAVITY_BRDIGE_CHAINLIST_ID, KAVA_CHAINLIST_ID } from '@/constants/cosmos/chain';

import { toBase64 } from '../string';

export function cosmosURL(lcdURL: string, chainId: string) {
  return {
    getNodeInfo: () => `${lcdURL}/cosmos/base/tendermint/v1beta1/node_info`,
    getBalance: (address: string) => `${lcdURL}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=10000`,
    getDelegations: (address: string) => `${lcdURL}/cosmos/staking/v1beta1/delegations/${address}`,
    getRewards: (address: string) => `${lcdURL}/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
    getUndelegations: (address: string) => `${lcdURL}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`,
    getAccount: (address: string) => `${lcdURL}/cosmos/auth/v1beta1/accounts/${address}`,
    getIncentive: (address: string) => (chainId === KAVA_CHAINLIST_ID ? `${lcdURL}/kava/incentive/v1beta1/rewards?owner=${address}` : ''),
    postBroadcast: () => `${lcdURL}/cosmos/tx/v1beta1/txs`,
    getCW20TokenInfo: (contractAddress: string) => `${lcdURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64('{"token_info":{}}')}`,
    getCW20Balance: (contractAddress: string, address: string) =>
      `${lcdURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64(`{"balance":{"address":"${address}"}}`)}`,
    getCW721NFTInfo: (contractAddress: string, tokenId: string) =>
      `${lcdURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64(`{"nft_info":{"token_id":"${tokenId}"}}`)}`,
    getCW721NFTIds: (contractAddress: string, ownerAddress: string, limit = 50) =>
      `${lcdURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64(`{"tokens":{"owner":"${ownerAddress}","limit":${limit},"start_after":"0"}}`)}`,
    getCW721ContractInfo: (contractAddress: string) => `${lcdURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64('{"contract_info":{}}')}`,
    getCW721NumTokens: (contractAddress: string) => `${lcdURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64('{"num_tokens":{}}')}`,
    getCW721CollectionInfo: (contractAddress: string) => `${lcdURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64('{"collection_info":{}}')}`,
    getClientState: (channelId: string, port?: string) => `${lcdURL}/ibc/core/channel/v1/channels/${channelId}/ports/${port || 'transfer'}/client_state`,
    simulate: () => `${lcdURL}/cosmos/tx/v1beta1/simulate`,
    getTxInfo: (txHash: string) => `${lcdURL}/cosmos/tx/v1beta1/txs/${txHash}`,
    getBlockLatest: () => (chainId === GRAVITY_BRDIGE_CHAINLIST_ID ? `${lcdURL}/blocks/latest` : `${lcdURL}/cosmos/base/tendermint/v1beta1/blocks/latest`),
    getCommission: (validatorAddress: string) => `${lcdURL}/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`,
    getFeemarket: (denom?: string) => `${lcdURL}/feemarket/v1/gas_prices${denom ? `/${denom}` : ''}`,
    getValidators: () => `${lcdURL}/cosmos/staking/v1beta1/validators?pagination.limit=10000`,
    getNTRNRewards: (contractAddress: string, address: string) =>
      `${lcdURL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${toBase64(`{"rewards":{"user":"${address}"}}`)}`,
  };
}
