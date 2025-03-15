import { createFileRoute } from '@tanstack/react-router';

import Entry from './-Entry';
import Layout from './-layout';

interface CancelUnstakingSearchParams {
  validatorAddress: string;
  amount: string;
  creationHeight: string;
}

export const Route = createFileRoute('/wallet/cancel-unstaking/$coinId/')({
  component: CancelUnstaking,
  validateSearch: (search: CancelUnstakingSearchParams): CancelUnstakingSearchParams => {
    return {
      validatorAddress: search.validatorAddress,
      amount: search.amount,
      creationHeight: search.creationHeight,
    };
  },
});

function CancelUnstaking() {
  const params = Route.useParams();

  const searchParam = Route.useSearch();

  const { validatorAddress, amount, creationHeight } = searchParam;

  return (
    <Layout>
      <Entry coinId={params.coinId} validatorAddress={validatorAddress} amount={amount} creationHeight={creationHeight} />
    </Layout>
  );
}
