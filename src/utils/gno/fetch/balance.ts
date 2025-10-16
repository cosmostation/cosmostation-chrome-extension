import type { GnoAbciQueryResponse } from '@/types/gno/rpc';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

import { requestRPC } from '../rpc';

/**
 * base64로 인코딩된 Go return 값을 파싱합니다.
 * 예: "(0 int64)" -> "0", "(10000000000 int64)" -> "10000000000"
 */
const parseGoReturnValue = (base64Data: string): string => {
  try {
    // base64 디코딩
    const decoded = atob(base64Data);

    if (decoded === 'null') {
      return '0';
    }

    // Go return 값 형식 파싱: (value type)
    const match = decoded.match(/^\((\d+)\s+\w+\)$/);

    if (match) {
      return match[1]; // 숫자 부분만 반환
    }

    // 매치되지 않으면 원본 반환
    return decoded;
  } catch (error) {
    // base64 디코딩 실패 시 원본 반환
    console.warn('Failed to parse Go return value:', error);
    return base64Data;
  }
};

/**
 * 잔액 데이터에서 숫자 부분과 단위 부분을 분리합니다.
 * 예: "10000000ugnot" -> { amount: "10000000", denom: "ugnot" }
 */
const parseBalanceData = (base64Data: string): { amount: string; denom: string } => {
  try {
    const balanceData = atob(base64Data);
    const match = balanceData.match(/^"(\d+)([a-zA-Z]+)"$/);

    if (match) {
      const [, amount, denom] = match;
      return { amount, denom };
    }

    const numericMatch = balanceData.match(/^(\d+)$/);
    if (numericMatch) {
      return { amount: numericMatch[1], denom: '' };
    }
    return { amount: '0', denom: '' };
  } catch {
    return { amount: '0', denom: '' };
  }
};

export const fetchGnoBalance = async (address: string, rpcUrls: string[]): Promise<string> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const path = `bank/balances/${address}`;

    const response = await requestRPC<GnoAbciQueryResponse>(rpcUrl, 'abci_query', { path });

    if (response.error) {
      throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: abci_query, Message: ${response.error?.message}`);
    }

    const base64Balance = response.result?.response?.ResponseBase?.Data;

    if (!base64Balance) {
      return '0';
    }

    const { amount } = parseBalanceData(base64Balance);

    return amount;
  });
};

export const fetchGrc20Balance = async (contract: string, address: string, rpcUrls: string[]): Promise<string> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const path = 'vm/qeval';
    const data = `${contract}.Balance("${address}")`;
    const base64Data = btoa(data);

    const response = await requestRPC<GnoAbciQueryResponse>(rpcUrl, 'abci_query', { path, data: base64Data });

    if (response.error) {
      throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: abci_query, Message: ${response.error?.message}`);
    }

    const base64Balance = response.result?.response?.ResponseBase?.Data;

    if (!base64Balance) {
      return '0';
    }

    const balance = parseGoReturnValue(base64Balance);
    return balance;
  });
};
