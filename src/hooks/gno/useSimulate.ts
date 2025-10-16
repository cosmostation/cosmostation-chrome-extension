import { useMemo } from 'react';
import Long from 'long';
import { decodeTxMessages } from '@gnolang/gno-js-client';
import type { Any } from '@gnolang/tm2-js-client';
import { JSONRPCProvider, Wallet } from '@gnolang/tm2-js-client';

import { getKeypair } from '@/libs/address';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useCurrentAccount } from '../useCurrentAccount';
import { useCurrentPassword } from '../useCurrentPassword';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseSimulateProps = {
  coinId: string;
  messages?: Any[];
  memo?: string;
  config?: UseFetchConfig;
};

export function useSimulate({ coinId, messages, memo, config }: UseSimulateProps) {
  const { getGnoAccountAsset } = useGetAccountAsset({ coinId });

  const asset = getGnoAccountAsset();

  const { currentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const accountAsset = getGnoAccountAsset();

  const rpcURLs = useMemo(() => accountAsset?.chain.rpcUrls.map((item) => item.url) || [], [accountAsset?.chain.rpcUrls]);

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (!accountAsset?.chain) {
        throw new Error('Chain not found');
      }

      if (!messages) {
        throw new Error('Messages not found');
      }

      const keypair = getKeypair(accountAsset.chain, currentAccount, currentPassword);

      const privateKey = Buffer.from(keypair.privateKey, 'hex');

      const provider = new JSONRPCProvider(rpcURLs[index]);

      const wallet = await Wallet.fromPrivateKey(privateKey, { addressPrefix: accountAsset.chain.accountPrefix });
      wallet.connect(provider);

      const signedTx = await wallet.signTransaction(
        {
          messages,
          fee: { gasFee: `0${accountAsset.chain.mainAssetDenom}`, gasWanted: new Long(1000000000000000) },
          signatures: [],
          memo: memo || '',
        },
        decodeTxMessages,
      );

      const estimateGas = await wallet.estimateGas(signedTx);

      return estimateGas;
    } catch {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, isFetched, error, refetch } = useFetch({
    queryKey: ['gnoEstimateGas', coinId, messages, memo],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!messages && !!rpcURLs.length && !!asset?.chain,
      refetchInterval: 1000 * 15,
      ...config,
    },
  });

  return { data, error, refetch, isLoading, isFetching, isFetched };
}
