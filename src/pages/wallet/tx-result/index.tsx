import { createFileRoute } from '@tanstack/react-router';

import Entry from './-Entry';
import Layout from './-layout';

type TxResultSearchParams = {
  coinId: string;
  txHash?: string;
  address?: string;
};

export const Route = createFileRoute('/wallet/tx-result/')({
  component: TxResult,
  validateSearch: (search?: TxResultSearchParams): TxResultSearchParams => {
    return {
      address: search?.address,
      txHash: search?.txHash,
      coinId: search?.coinId || '',
    };
  },
});

function TxResult() {
  const searchParam = Route.useSearch();

  const { address, txHash, coinId } = searchParam;

  return (
    <Layout>
      <Entry coinId={coinId} txHash={txHash} address={address} />
    </Layout>
  );
}
