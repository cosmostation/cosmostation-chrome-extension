import { useQueries } from '@tanstack/react-query';

import { post } from '@/utils/axios';

type UseRawTxListResponse = {
  result: string;
  error: unknown | null;
  id: number;
};

type UseRawTxListProps = {
  rpcURL: string;
  txInfos: {
    txId: string;
    blockHash: string;
  }[];
  enabled?: boolean;
};

async function fetchRawTx(url: string, txId: string, blockHash: string): Promise<UseRawTxListResponse> {
  return post<UseRawTxListResponse>(url, { method: 'getrawtransaction', params: [txId, false, blockHash], id: 1, jsonrpc: '2.0' });
}

export function useRawTxList({ rpcURL, txInfos, enabled = true }: UseRawTxListProps) {
  const queries = useQueries({
    queries: txInfos.map((txInfo) => ({
      queryKey: ['rawTx', rpcURL, txInfo.txId],
      queryFn: () => fetchRawTx(rpcURL, txInfo.txId, txInfo.blockHash),
      staleTime: Infinity,
      enabled: !!rpcURL && !!txInfo.txId && !!txInfo.blockHash && enabled,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const rawTxMap: Record<string, string> = {};

  queries.forEach((q, i) => {
    if (q.data) {
      rawTxMap[txInfos[i].txId] = q.data.result;
    }
  });

  return { rawTxMap, isLoading };
}
