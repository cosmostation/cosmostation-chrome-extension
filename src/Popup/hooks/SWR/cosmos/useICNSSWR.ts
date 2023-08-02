import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { OSMOSIS } from '~/constants/chain/cosmos/osmosis';
import { get } from '~/Popup/utils/axios';
import type { CosmosChain } from '~/types/chain';
import type { ICNSResponse } from '~/types/cosmos/ICNS';

import { useCurrentChain } from '../../useCurrent/useCurrentChain';

type FetchProps = {
  chain: CosmosChain;
  name?: string;
};

export type UseICNSSWRProps = {
  name: string;
  cosmosChain?: CosmosChain;
};

export function useICNSSWR({ name, cosmosChain }: UseICNSSWRProps, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const chain = cosmosChain ?? currentChain;

  const fetcher = async (props: FetchProps) => {
    try {
      if (!props.name || props.chain.line !== 'COSMOS') {
        return null;
      }

      const nameToBase64 = Buffer.from(JSON.stringify({ address_by_icns: { icns: `${props.name}.${props.chain.bech32Prefix.address}` } }), 'utf8').toString(
        'base64',
      );

      return await get<ICNSResponse>(
        `${OSMOSIS.restURL}/cosmwasm/wasm/v1/contract/osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd/smart/${nameToBase64}`,
      );
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<ICNSResponse | null, AxiosError>({ name, chain }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
