import type { ProtoBuilderDecodeResponse } from '@/types/cosmos/protoBuilder';
import { post } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';

type UseProtoBuilderDecoderProps = {
  authInfoBytes: string;
  txBodyBytes: string;

  config?: UseFetchConfig;
};

export function useProtoBuilderDecoder({ authInfoBytes, txBodyBytes, config }: UseProtoBuilderDecoderProps) {
  const requestURL = 'https://proto.mintscan.io/proto/decode';

  const fetcher = async () => {
    try {
      if (!authInfoBytes || !txBodyBytes) {
        return null;
      }

      return await post<ProtoBuilderDecodeResponse>(requestURL, {
        auth_info_bytes: authInfoBytes,
        body_bytes: txBodyBytes,
      });
    } catch {
      return null;
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['protoBuilderDecoder', authInfoBytes, txBodyBytes],
    fetchFunction: () => fetcher(),
    config: {
      retry: false,
      enabled: !!authInfoBytes && !!txBodyBytes,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
