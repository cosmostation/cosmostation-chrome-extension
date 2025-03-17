import { createFileRoute } from '@tanstack/react-router';

import Entry from '../-Entry';
import Layout from '../-Layout';

interface UnstakeSearchParams {
  objectId?: string;
}

export const Route = createFileRoute('/wallet/unstake/$coinId/$validatorAddress/')({
  component: Unstake,
  validateSearch: (search?: UnstakeSearchParams): UnstakeSearchParams => {
    return {
      objectId: search?.objectId,
    };
  },
});

function Unstake() {
  const params = Route.useParams();
  const searchParam = Route.useSearch();
  const { objectId } = searchParam;

  return (
    <Layout>
      <Entry coinId={params.coinId} validatorAddress={params.validatorAddress} objectId={objectId} />
    </Layout>
  );
}
