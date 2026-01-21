import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import type {
  SolanaGetBalance,
  SolanaGetTokenAccountsByOwner,
  SolanaRpcGetBalanceResponse,
  SolanaRpcGetTokenAccountsByOwnerResponse,
} from '@/types/solana/api';
import { postWithFullResponse } from '@/utils/axios';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

export const fetchSolanaBalances = async (address: string, rpcUrls: string[]): Promise<SolanaGetBalance> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const body = { jsonrpc: '2.0', method: 'getBalance', params: [address], id: 1 };

    const response = await postWithFullResponse<SolanaRpcGetBalanceResponse>(rpcUrl, body, { timeout: BALANCE_FETCH_TIME_OUT_MS });

    if (response.data.error) {
      throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: ${body.method}, Message: ${response.data.error?.message}`);
    }

    const balance = response.data?.result ?? { value: 0, context: { apiVersion: '', slot: 0 } };

    return balance;
  });
};

export const fetchSolanaSplTokenBalances = async (address: string, programId: string, rpcUrls: string[]): Promise<SolanaGetTokenAccountsByOwner> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const body = { jsonrpc: '2.0', method: 'getTokenAccountsByOwner', params: [address, { programId }, { encoding: 'jsonParsed' }], id: 1 };

    const response = await postWithFullResponse<SolanaRpcGetTokenAccountsByOwnerResponse>(rpcUrl, body, { timeout: BALANCE_FETCH_TIME_OUT_MS });

    if (response.data.error) {
      throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: ${body.method}, Message: ${response.data.error?.message}`);
    }

    const balance = response.data?.result ?? { value: [], context: { apiVersion: '', slot: 0 } };

    return balance;
  });
};
