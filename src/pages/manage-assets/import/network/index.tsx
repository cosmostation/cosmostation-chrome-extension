import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-assets/import/network/')({
  component: ImportCustomNetwork,
});

// NOTE 체인 추가 시 기본 메인 코인은 visible도 같이 추가되도록 작업.
function ImportCustomNetwork() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
