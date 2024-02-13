import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import type { ProtoBuilderDecodeResponse } from '~/types/cosmos/protoBuilder';

type FetchParams = {
  url: string;
  body: {
    auth_info_bytes: string;
    body_bytes: string;
  };
};

type UseProtoBuilderDecodeSWRPRops = {
  authInfoBytes: string;
  txBodyBytes: string;
};

export function useProtoBuilderDecodeSWR({ authInfoBytes, txBodyBytes }: UseProtoBuilderDecodeSWRPRops, config?: SWRConfiguration) {
  const requestURL = 'https://proto.mintscan.io/proto/decode';

  const fetcher = async (params: FetchParams) => {
    try {
      if (!params.body.auth_info_bytes || !params.body.body_bytes) {
        return null;
      }

      return await post<ProtoBuilderDecodeResponse>(params.url, {
        auth_info_bytes: params.body.auth_info_bytes,
        body_bytes: params.body.body_bytes,
      });
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<ProtoBuilderDecodeResponse | null, AxiosError>(
    { url: requestURL, body: { auth_info_bytes: authInfoBytes, body_bytes: txBodyBytes } },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      ...config,
    },
  );

  return { data, error, mutate };
}
