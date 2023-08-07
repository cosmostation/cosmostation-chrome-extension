import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ARCHWAY } from '~/constants/chain/cosmos/archway';
import { get } from '~/Popup/utils/axios';
import type { CosmosChain } from '~/types/chain';
import type { ArchIDResponse } from '~/types/cosmos/ICNS';

import { useCurrentChain } from '../../useCurrent/useCurrentChain';

type FetchProps = {
  chain: CosmosChain;
  archID?: string;
};

export type UseArchIDSWRProps = {
  archID: string;
  cosmosChain?: CosmosChain;
};

export function useArchIDSWR({ archID, cosmosChain }: UseArchIDSWRProps, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const chain = cosmosChain ?? currentChain;

  const fetcher = async (props: FetchProps) => {
    try {
      if (!props.archID || props.chain.line !== 'COSMOS') {
        return null;
      }

      const archId = props.archID.endsWith('.arch') ? props.archID : `${props.archID}.arch`;

      const nameToBase64 = Buffer.from(
        JSON.stringify({
          resolve_record: {
            name: archId,
          },
        }),
        'utf8',
      ).toString('base64');

      return await get<ArchIDResponse>(
        `${ARCHWAY.restURL}/cosmwasm/wasm/v1/contract/archway1275jwjpktae4y4y0cdq274a2m0jnpekhttnfuljm6n59wnpyd62qppqxq0/smart/${nameToBase64}`,
      );
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<ArchIDResponse | null, AxiosError>({ archID, chain }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
