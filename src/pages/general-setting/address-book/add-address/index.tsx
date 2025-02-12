import { createFileRoute } from '@tanstack/react-router';

import type { UniqueChainId } from '@/types/chain';

import Entry from './-entry';
import Layout from './-layout';

type AddAddressSearchParams = {
  chainId?: UniqueChainId;
  address?: string;
  memo?: string;
};

export const Route = createFileRoute('/general-setting/address-book/add-address/')({
  component: AddAddress,
  validateSearch: (search?: AddAddressSearchParams): AddAddressSearchParams => {
    return {
      chainId: search?.chainId,
      address: search?.address,
      memo: search?.memo,
    };
  },
});

function AddAddress() {
  const searchParam = Route.useSearch();

  const { address, chainId, memo } = searchParam;

  return (
    <Layout>
      <Entry chainId={chainId} address={address} memo={memo} />
    </Layout>
  );
}
